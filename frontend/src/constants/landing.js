import { ACCOUNT_TYPES } from "./accountTypes.js";

// هنا زر الرئيسية لمن يكون داخل بحسابه، ويودي لصفحته حسب نوع الحساب
export const LANDING_CTA = {
  [ACCOUNT_TYPES.MERCHANT.value]: "سوق الجملة ←",
  [ACCOUNT_TYPES.SUPPLIER.value]: "لوحة المورد ←",
};
