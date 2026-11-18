import { CHECKOUT_STORAGE_KEY } from "../constants/payment.js";

// هنا الفاتورة تنحفظ لين يخلص الدفع، عشان تحديث الصفحة ما يضيعها
export function saveCheckout(checkout) {
  sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkout));
}

export function readCheckout() {
  const saved = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function forgetCheckout() {
  sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
}
