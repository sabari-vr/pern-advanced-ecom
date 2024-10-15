import cloudinary from "../config/cloudinary.js";
import { redis } from "../config/redis.js";
import crypto from "crypto";
import prisma from "../config/prisma.js";

export const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: id } });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        batchId: product.batchId,
        id: {
          not: id,
        },
      },
      select: {
        id: true,
        color: true,
        images: true,
      },
    });

    const related = relatedProducts.map((p) => ({
      color: p.color,
      id: p.id,
      image: p.images[0],
    }));

    res.json({ product, related });
  } catch (error) {
    console.log("Error in getProductById controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
    });

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const genarateSignedURl = (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha256")
    .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  const signedUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload?api_key=${process.env.CLOUDINARY_API_KEY}&timestamp=${timestamp}&signature=${signature}`;

  res.status(200).json({ signedUrl });
};

export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const {
      name,
      description,
      price,
      categoryId,
      size,
      color,
      batchId,
      images,
      gender,
      for: audiance,
    } = productData;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        sizes: size,
        color,
        batchId,
        images,
        gender: parseInt(gender),
        for: parseInt(audiance),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const {
      name,
      description,
      price,
      categoryId,
      size,
      color,
      batchId,
      images,
      gender,
      for: audiance,
    } = productData;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        sizes: size,
        color,
        batchId,
        images,
        gender: parseInt(gender),
        for: parseInt(audiance),
      },
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (imageUrl) => {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
          console.log(`Deleted image from Cloudinary: ${imageUrl}`);
        } catch (error) {
          console.log(
            `Error deleting image from Cloudinary: ${imageUrl}`,
            error
          );
        }
      });

      await Promise.all(deletePromises);
    }
    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await prisma.$queryRaw`
    SELECT id, name, description, images, price
    FROM "Product"
    ORDER BY RANDOM()
    LIMIT 4;
  `;

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { gender, forAudience, size, minPrice, maxPrice } = req.query;

  const filter = {
    categoryId: category,
    ...(gender && { gender: parseInt(gender) }),
    ...(forAudience && { for: parseInt(forAudience) }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        }
      : {}),
    ...(size && { [`size.${size}`]: { not: null } }),
  };

  try {
    const products = await prisma.product.findMany({
      where: filter,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalProducts = await prisma.product.count({ where: filter });
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (product) {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          isFeatured: !product.isFeatured,
        },
      });

      await updateFeaturedProductsCache();

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}
