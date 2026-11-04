import { USE_MOCK } from "../config.js";
import { postJson } from "./http.js";

const MOCK_CREATED_ORDERS_KEY = "mock-created-orders";

const ORDERS_ENDPOINT = "/api/orders";

// هنا الطلبات اللي انسوت بالوضع المؤقت، عشان تطلع في صفحة طلباتي
export function getMockCreatedOrders() {
  return JSON.parse(localStorage.getItem(MOCK_CREATED_ORDERS_KEY) || "[]");
}

// هنا أبني طلبات مؤقتة من السلة، طلب لكل مورد مثل الباك
function createMockOrders(lines) {
  const bySupplier = {};
  for (const line of lines) {
    const key = line.supplier_name || "مورد";
    if (!bySupplier[key]) bySupplier[key] = [];
    bySupplier[key].push(line);
  }

  const orders = Object.keys(bySupplier).map((supplierName, index) => {
    const supplierLines = bySupplier[supplierName];
    let total = 0;
    for (const line of supplierLines) {
      total += line.price * line.quantity;
    }

    return {
      id: `MK-${String(Date.now()).slice(-4)}${index}`,
      created_at: new Date().toISOString().slice(0, 10),
      status: "pending",
      supplier_name: supplierName,
      items_summary: supplierLines.map((line) => line.name).join("، "),
      total,
    };
  });

  localStorage.setItem(
    MOCK_CREATED_ORDERS_KEY,
    JSON.stringify([...orders, ...getMockCreatedOrders()])
  );
  return orders;
}

// هنا أرسل السلة للباك، والباك يقسمها طلب لكل مورد
export async function createOrder(lines) {
  if (USE_MOCK) {
    return { status: 201, data: { orders: createMockOrders(lines) } };
  }

  const items = lines.map((line) => ({
    product_id: line.product_id,
    quantity: line.quantity,
  }));
  return postJson(ORDERS_ENDPOINT, { items });
}