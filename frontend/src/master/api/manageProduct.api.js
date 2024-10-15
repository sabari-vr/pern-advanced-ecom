import { Axios } from "../../utils";

export const createProduct = async (payload) => {
  const res = await Axios.post("/products", payload);
  return res.data;
};

export const updateProduct = async ({ id, finalProductData }) => {
  const res = await Axios.put(`/products/${id}`, finalProductData);
  return res.data;
};

export const getAllProducts = async (page) => {
  const res = await Axios.get(`/products?page=${page}&limit=5`);
  return res.data;
};

export const getSignedURL = async () => {
  const res = await Axios.get(`/products/generate-signed-url`);
  return res.data;
};

export const getFeaturedProduct = async () => {
  const res = await Axios.get("/products/featured");
  return res.data;
};

export const getProductsByID = async (id) => {
  const res = await Axios.get(`/products/${id}`);
  return res.data;
};

export const deleteProductFn = async (id) => {
  const res = await Axios.delete(`/products/${id}`);
  return res.data;
};

export const toogleFeaturedProduct = async (id) => {
  const res = await Axios.patch(`/products/${id}`);
  return res.data;
};
