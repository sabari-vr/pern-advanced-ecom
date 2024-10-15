import prisma from "../config/prisma.js";

export const getAddress = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json(addresses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching addresses", error: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const { address, city, country, pincode, name, contact } = req.body;
    const savedAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        name,
        contact,
        address,
        city,
        country,
        pincode,
      },
    });
    res.status(201).json(savedAddress);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating address", error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id: addressId } = req.params;
    const { address, city, country, pincode, name, contact } = req.body;

    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId,
        userId: req.user.id,
      },
      data: {
        name,
        contact,
        address,
        city,
        country,
        pincode,
      },
    });

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or not authorized" });
    }

    res.status(200).json(updatedAddress);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating address", error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id: addressId } = req.params;
    const deletedAddress = await prisma.address.delete({
      where: { id: addressId, userId: req.user.id },
    });

    if (!deletedAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or not authorized" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting address", error: error.message });
  }
};

export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        wishList: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user.wishList);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingWishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    });

    if (existingWishlistItem) {
      await prisma.wishlist.delete({
        where: {
          id: existingWishlistItem.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
      });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: userId,
          productId: productId,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
