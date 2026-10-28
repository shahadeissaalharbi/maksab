import { USE_MOCK } from "../config.js";
import { getJson } from "./http.js";
import { MOCK_PRODUCTS } from "./mockProducts.js";

const TRADER_ENDPOINTS = {
  // مؤقتًا لين ينزل /api/trader/home على Railway
  HOME: "/api/products",
};

// هنا أجيب منتجات سوق الجملة، والصفحة ما تعرف إذا هي مؤقتة أو من الباك
export async function getTraderProducts() {
  if (USE_MOCK) {
    return { status: 200, data: { products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length } };
  }

  return getJson(TRADER_ENDPOINTS.HOME);
}