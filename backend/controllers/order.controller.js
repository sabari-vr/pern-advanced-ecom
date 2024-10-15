import {
  sendOrderCancelEmail,
  sendOrderStatusChangeEmail,
} from "../email/emails.js";
import prisma from "../config/prisma.js";

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true, name: true },
        },
        payment: {
          select: {
            date: true,
            razorpayOrderId: true,
            razorpayPaymentId: true,
          },
        },
      },
    });

    const totalOrders = await prisma.order.count();
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving orders",
    });
  }
};

export const getMyOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalOrders = await prisma.order.count({
      where: { userId: req.user.id },
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving orders",
    });
  }
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({ where: { id: id } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    await prisma.order.update({
      where: { id: id },
      data: { orderStatus: "cancelled" },
    });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    await sendOrderCancelEmail(user.email);

    return res
      .status(200)
      .json({ message: "Order cancelled successfully", order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: id } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = [
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" }); // Handle invalid status
    }

    await prisma.order.update({
      where: { id: id },
      data: { orderStatus: status },
    });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    await sendOrderStatusChangeEmail(user.email, capitalizeFirstLetter(status));

    return res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
