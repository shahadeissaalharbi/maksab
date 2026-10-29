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
  BUSINESS_INFO: "/business-info",
  MY_ORDERS: "/orders",
};

// هنا كل نوع حساب وين يروح بعد الدخول
export const ROLE_HOME = {
  [ACCOUNT_TYPES.MERCHANT.value]: ROUTES.TRADER_HOME,
  [ACCOUNT_TYPES.SUPPLIER.value]: ROUTES.SUPPLIER_HOME,
};
