import { ACCOUNT_TYPES } from "./accountTypes.js";

// هنا روابط الصفحات في مكان واحد، ومجمدة عشان ما تتغير بالغلط
export const ROUTES = Object.freeze({
  HOME: "/",
  REGISTER: "/register",
  LOGIN: "/login",
  LANDING: "/home",
  CALCULATOR: "/calculator",
  TRADER_HOME: "/trader",
  SUPPLIER_HOME: "/supplier",
    SUPPLIER_PRODUCTS: "/supplier/products",
});

// هنا كل نوع حساب وين يروح بعد الدخول
export const ROLE_HOME = Object.freeze({
  [ACCOUNT_TYPES.MERCHANT.value]: ROUTES.TRADER_HOME,
  [ACCOUNT_TYPES.SUPPLIER.value]: ROUTES.SUPPLIER_HOME,
});