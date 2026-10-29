import { USE_MOCK } from "../config.js";
import { getJson } from "./http.js";
import { MOCK_MY_ORDERS } from "./mockMyOrders.js";

const ORDERS_ENDPOINTS = Object.freeze({
  LIST: "/api/orders",
  RECEIPT: "/api/orders/receipt",
});

// هنا أجيب طلباتي، مؤقتة أو من الباك
export async function getMyOrders() {
  if (USE_MOCK) {
    return { status: 200, data: MOCK_MY_ORDERS };
  }

  return getJson(ORDERS_ENDPOINTS.LIST);
}