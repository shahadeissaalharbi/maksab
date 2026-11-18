import { getJson, postJson } from "./http.js";

const CHECKOUTS_ENDPOINT = "/api/checkouts";

// هنا أرسل المنتجات والكميات بس، والسعر يحسبه الباك
export function createCheckout(lines) {
  const items = lines.map((line) => ({
    product_id: line.product_id,
    quantity: line.quantity,
  }));
  return postJson(CHECKOUTS_ENDPOINT, { items });
}

// هنا أسأل الباك عن حالة الفاتورة
export function getCheckout(checkoutId) {
  return getJson(`${CHECKOUTS_ENDPOINT}/${checkoutId}`);
}
