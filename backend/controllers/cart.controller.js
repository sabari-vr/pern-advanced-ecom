import prisma from "../config/prisma.js";

export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cartItems: {
          orderBy: { createdAt: "asc" },
          include: {
            product: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartItems = user.cartItems.map((cartItem) => ({
      id: cartItem.product.id,
      name: cartItem.product.name,
      description: cartItem.product.description,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      size: cartItem.size,
      images: cartItem.product.images,
    }));

    return res.json(cartItems);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCartProductsById = async (req, res) => {
  const productItems = req.body;

  try {
    const productIds = productItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    const cartItems = productItems.map((item) => {
      const product = productMap[item.productId];
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      return {
        ...product,
        quantity: item.quantity || 1,
        size: item.size || null,
      };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, size } = req.body;

    const userId = req.user.id;

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: userId,
        productId: productId,
        size: size,
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + 1,
        },
      });

      return res.json(updatedItem);
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: productId,
          size: size,
          quantity: 1,
        },
      });

      return res.json(newItem);
    }
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        cartItems: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!productId) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: userId,
        },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: {
          userId: userId,
          productId: productId,
          size: size,
        },
      });
    }

    const updatedCartItems = await prisma.cartItem.findMany({
      where: {
        userId: userId,
      },
    });

    res.json(updatedCartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity, size } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cartItems: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.sizes.hasOwnProperty(size)) {
      return res.status(400).json({ message: "Invalid size for this product" });
    }

    const existingItem = await prisma.cartItem.findMany({
      where: {
        userId: userId,
        productId: productId,
        size: size,
      },
    });

    if (existingItem.length > 0) {
      if (quantity < 1) {
        await prisma.cartItem.delete({
          where: {
            id: existingItem[0].id,
          },
        });
      } else {
        if (product.sizes[size] < quantity) {
          return res.status(400).json({
            message: "Not enough stock",
            availableStock: product.sizes[size],
          });
        }

        await prisma.cartItem.update({
          where: {
            id: existingItem[0].id,
          },
          data: {
            quantity: quantity,
          },
        });
      }
    } else {
      if (quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }

      if (product.sizes[size] < quantity) {
        return res.status(400).json({
          message: "Not enough stock",
          availableStock: product.sizes[size],
        });
      }

      await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: productId,
          size: size,
          quantity: quantity,
        },
      });
    }

    const updatedCartItems = await prisma.cartItem.findMany({
      where: {
        userId: userId,
      },
      orderBy: [{ createdAt: "asc" }],
    });

    return res.json(updatedCartItems);
  } catch (error) {
    console.error("Error in updateQuantity controller", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
