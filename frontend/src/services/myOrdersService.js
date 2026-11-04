import { USE_MOCK } from "../config.js";
import { getJson } from "./http.js";
import { getMockCreatedOrders } from "./ordersService.js";
import { MOCK_MY_ORDERS } from "./mockMyOrders.js";

const ORDERS_ENDPOINTS = {
  LIST: "/api/orders",
  RECEIPT: "/api/orders/receipt",
};

// هنا أجيب طلباتي، مؤقتة أو من الباك
export async function getMyOrders() {
  if (USE_MOCK) {
    const orders = [...getMockCreatedOrders(), ...MOCK_MY_ORDERS.orders];
    return { status: 200, data: { orders } };
  }

  const result = await getJson(ORDERS_ENDPOINTS.LIST);
  if (result.status !== 200) return result;

  // الباك يرجع المجموع نص، والبطاقة تبيه رقم
  const orders = (result.data.orders || []).map((order) => ({
    ...order,
    total: Number(order.total_amount || order.total || 0),
  }));
  return { status: 200, data: { orders } };
}