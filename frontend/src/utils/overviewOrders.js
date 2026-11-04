import { ORDER_STATUS_FLOW, UI_STATUS } from "../constants/overview.js";

// هنا أرتب صف الطلب اللي جاي من الباك على شكل اللي تقراه الواجهة
export function normalizeOrder(order) {
  const total = order.total !== undefined ? order.total : order.total_amount;

  return {
    ...order,
    customer: order.customer || "عميل",
    district: order.district || "",
    items_count: Number(order.items_count) || 0,
    total: Number(total) || 0,
    status: UI_STATUS[order.status] || order.status,
  };
}

// هنا أي حالات تنفع من الحالة الحالية: هي نفسها والخطوة اللي بعدها بس
export function getAllowedStatuses(current) {
  const index = ORDER_STATUS_FLOW.indexOf(current);
  if (index === -1) return [current];
  return ORDER_STATUS_FLOW.slice(index, index + 2);
}
