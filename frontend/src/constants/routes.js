import { ACCOUNT_TYPES } from "./accountTypes.js";

// هنا روابط الصفحات في مكان واحد
export const ROUTES = {
  HOME: "/",
  REGISTER: "/register",
  LOGIN: "/login",
  LANDING: "/home",
  CALCULATOR: "/calculator",
  TRADER_HOME: "/trader",
  SUPPLIER_HOME: "/supplier",
  SUPPLIER_PRODUCTS: "/supplier/products",
  // هنا صفحات «قريبًا» في لوحة المورد
  SUPPLIER_ORDERS: "/supplier/orders",
  SUPPLIER_MESSAGES: "/supplier/messages",
  // هنا صفحات «قريبًا» للأسر المنتجة
  ACADEMY: "/academy",
  PARTNERS: "/partners",
  BUSINESS_INFO: "/business-info",
  MY_ORDERS: "/orders",
  CART: "/cart",
  PAYMENT: "/payment",
  PAYMENT_RESULT: "/payment/result/:checkoutId",
  SUPPLIER_LOGIN: "/supplier/login",

  PROFILE: "/profile",
};

export const paymentResultPath = (checkoutId) =>
  `/payment/result/${checkoutId}`;

// هنا كل نوع حساب وين يروح بعد الدخول
export const ROLE_HOME = {
  [ACCOUNT_TYPES.MERCHANT.value]: ROUTES.TRADER_HOME,
  [ACCOUNT_TYPES.SUPPLIER.value]: ROUTES.SUPPLIER_HOME,
};
