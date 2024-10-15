import cloudinary from "../config/cloudinary.js";
import prisma from "../config/prisma.js";

export const createCategory = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const images = JSON.parse(req.body.images);
    const { name } = data;

    const file = images[0];

    const cloudinaryResponse = await cloudinary.uploader.upload(file.base64, {
      folder: "category",
    });

    const newCategory = await prisma.category.create({
      data: {
        name: name,
        image: cloudinaryResponse.secure_url,
      },
    });

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({});
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting categories:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({ where: { id: id } });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error getting category by ID:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;

  const data = JSON.parse(req?.body?.data);
  const images = req?.body?.images ? JSON.parse(req?.body?.images) : [];
  const { name } = data;

  try {
    let cloudinaryResponse;

    const file = images[0];
    if (file && file.base64) {
      cloudinaryResponse = await cloudinary.uploader.upload(file.base64, {
        folder: "category",
      });
    }

    const category = await prisma.category.update({
      where: { id: id },
      data: {
        name,
        ...(cloudinaryResponse?.secure_url && {
          image: cloudinaryResponse.secure_url,
        }),
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({ where: { id: id } });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await prisma.product.findMany({
      where: { categoryId: id },
    });

    if (products.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category because it contains products.",
      });
    }

    const imagePublicId = category.image.split("/").pop().split(".")[0];
    try {
      await cloudinary.uploader.destroy(`category/${imagePublicId}`);
      console.log(`Deleted image from Cloudinary`);
    } catch (error) {
      console.log(`Error deleting image from Cloudinary`, error);
    }

    await prisma.category.delete({
      where: { id: id },
    });

    res
      .status(200)
      .json({ message: "Category and image deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
