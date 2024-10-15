import crypto from "crypto";
import Razorpay from "razorpay";
import { sendOrderSuccessEmail } from "../email/emails.js";
import prisma from "../config/prisma.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

export const orderAPI = async (req, res) => {
  const { amount, itemsInCart } = req.body;

  try {
    for (const item of itemsInCart) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.name}` });
      }

      const availableSizes = product.sizes;

      if (!availableSizes.hasOwnProperty(item.size)) {
        return res.status(400).json({
          message: `Invalid size ${item.size} for product ${product.name}`,
        });
      }

      const availableStock = availableSizes[item.size];

      if (availableStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product ${product.name} in size ${item.size}`,
          availableStock,
          requestedQuantity: item.quantity,
        });
      }
    }

    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.error("Razorpay order creation error:", error);
        return res.status(500).json({ message: "Failed to create order" });
      }
      res.status(200).json({ data: order });
    });
  } catch (error) {
    console.error("Error in orderAPI:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const veifyOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    itemsInCart,
    deliveryAddress,
    clearCart,
  } = req.body;

  try {
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(sign.toString())
      .digest("hex");
    console.log(expectedSign);
    console.log(razorpay_signature);

    const isAuthentic = expectedSign === razorpay_signature;

    if (isAuthentic) {
      const savedPayment = await prisma.payment.create({
        data: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });

      await prisma.order.create({
        data: {
          paymentId: savedPayment.id,
          userId: req.user.id,
          items: itemsInCart.map((item) => ({
            productId: item.productId,
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
          })),
          address: deliveryAddress,
        },
      });

      await prisma.$transaction(async (tx) => {
        for (const item of itemsInCart) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          const availableSizes = product.sizes;

          if (!availableSizes.hasOwnProperty(item.size)) {
            throw new Error(
              `Invalid size ${item.size} for product ${product.name}`
            );
          }

          if (availableSizes[item.size] < item.quantity) {
            throw new Error(
              `Insufficient stock for product ${product.name} in size ${item.size}`
            );
          }

          availableSizes[item.size] -= item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: { sizes: availableSizes },
          });
        }

        if (clearCart) {
          await tx.cartItem.deleteMany({
            where: { userId: req.user.id },
          });
        }
      });

      await sendOrderSuccessEmail(req.user.email);

      res.status(201).json({
        message: "Order placed Successfully",
        orderId: razorpay_order_id,
      });
    } else {
      console.log("Invalid signature");
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error in verifyOrder:", error);
    res.status(500).json({
      message: "Internal Server Error!",
      error: error.message,
      stack: error.stack,
    });
  }
};
