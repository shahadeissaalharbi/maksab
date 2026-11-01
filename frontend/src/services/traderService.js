import { USE_MOCK } from "../config.js";
import { getJson } from "./http.js";
import { MOCK_PRODUCTS } from "./mockProducts.js";

const MOCK_ADDED_PRODUCTS_KEY = "mock-market-products";

const TRADER_ENDPOINTS = {
  // مؤقتًا لين ينزل /api/trader/home على Railway
  HOME: "/api/products",
};

// هنا أجيب منتجات سوق الجملة، والصفحة ما تعرف إذا هي مؤقتة أو من الباك
export async function getTraderProducts() {
  if (USE_MOCK) {
    const added = JSON.parse(localStorage.getItem(MOCK_ADDED_PRODUCTS_KEY) || "[]");
    const products = [...MOCK_PRODUCTS];
    added.forEach((product) => {
      if (!products.some((item) => item.name === product.name)) {
        products.push(product);
      }
    });
    return { status: 200, data: { products, total: products.length } };
  }

  return getJson(TRADER_ENDPOINTS.HOME);
}