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
<<<<<<< HEAD
    SUPPLIER_PRODUCTS: "/supplier/products",
});
=======
  BUSINESS_INFO: "/business-info",
};
>>>>>>> 136beda0659a647e35b4ae520d69fb53cac80b19

// هنا كل نوع حساب وين يروح بعد الدخول
export const ROLE_HOME = {
  [ACCOUNT_TYPES.MERCHANT.value]: ROUTES.TRADER_HOME,
  [ACCOUNT_TYPES.SUPPLIER.value]: ROUTES.SUPPLIER_HOME,
};
