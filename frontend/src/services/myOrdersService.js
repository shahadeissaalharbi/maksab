import { USE_MOCK } from "../config.js";
import { getJson } from "./http.js";
import { MOCK_MY_ORDERS } from "./mockMyOrders.js";

// هنا أجيب طلبات الأسرة المنتجة، مؤقتة أو من الباك
export async function getMyOrders() {
  if (USE_MOCK) {
    return { status: 200, data: MOCK_MY_ORDERS };
  }

  return getJson("/api/orders");
}
