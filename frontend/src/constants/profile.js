import { HTTP_STATUS } from "./messages.js";

// هنا كلام قائمة حسابي (العلامة اللي في الشريط)
export const PROFILE_MENU_TEXT = {
  LABEL: "حسابي",
  PROFILE: "بياناتي وكلمة المرور",
  LOGOUT: "تسجيل الخروج",
};

// هنا كلام صفحة حسابي في مكان واحد
export const PROFILE_TEXT = {
  TITLE: "حسابي",
  SUBTITLE: "بياناتك وكلمة المرور وحذف الحساب في مكان واحد",
  VERIFIED: "موثق ✓",
  DATA_TITLE: "بياناتي",
  NAME: "اسم النشاط",
  PHONE: "رقم الجوال",
  PHONE_HINT: "مثال: 05xxxxxxxx (اختياري)",
  REGISTER: "رقم السجل التجاري",
  REGISTER_HINT: "10 أرقام (اختياري)",
  ADDRESS: "العنوان",
  ADDRESS_PLACEHOLDER: "الحي والشارع ورقم المبنى",
  SAVE: "حفظ التغييرات",
  SAVING: "جاري الحفظ...",
  SAVED: "انحفظت بياناتك ✓",
  PASSWORD_TITLE: "كلمة المرور",
  PASSWORD_NOTE: "كلمة المرور مشفرة وما نقدر نعرضها. تقدر تغيرها من هنا.",
  CURRENT_PASSWORD: "كلمة المرور الحالية",
  NEW_PASSWORD: "كلمة المرور الجديدة",
  NEW_PASSWORD_HINT: "8 أحرف أو أكثر",
  CONFIRM_PASSWORD: "تأكيد كلمة المرور الجديدة",
  CHANGE_PASSWORD: "تغيير كلمة المرور",
  CHANGING_PASSWORD: "جاري التغيير...",
  PASSWORD_CHANGED: "تغيرت كلمة المرور ✓",
  DANGER_TITLE: "حذف الحساب",
  DANGER_TEXT: "حذف الحساب نهائي وما يرجع. اكتب كلمة المرور للتأكيد.",
  PASSWORD: "كلمة المرور",
  DELETE: "حذف حسابي",
  CONFIRM_DELETE: "نعم، احذف حسابي",
  DELETING: "جاري الحذف...",
  CANCEL: "إلغاء",
};

// هنا رسائل التنبيه وقت الكتابة
export const PROFILE_ERRORS = {
  PHONE: "رقم الجوال لازم يكون مثل 05xxxxxxxx",
  REGISTER: "رقم السجل التجاري لازم يكون 10 أرقام",
  PASSWORD_SHORT: "كلمة المرور لازم تكون 8 أحرف أو أكثر",
  PASSWORD_MISMATCH: "كلمتا المرور غير متطابقتين",
};

const NOT_READY_MESSAGE = "هالخدمة لسا ما نزلت عندنا، نرجو المحاولة لاحقًا";

// هنا رسالة لكل رد من الباك على حذف الحساب
export const DELETE_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: "نرجو كتابة كلمة المرور للتأكيد",
  [HTTP_STATUS.UNAUTHORIZED]: "كلمة المرور غير صحيحة",
  [HTTP_STATUS.NOT_FOUND]: NOT_READY_MESSAGE,
  405: NOT_READY_MESSAGE,
  [HTTP_STATUS.CONFLICT]: "عندك طلبات جارية، نرجو إتمامها قبل حذف الحساب",
  NETWORK: "الإنترنت فصل في نص الطريق، نرجو التأكد منه",
  DEFAULT: "الخلل عندنا مو عندك، نرجو المحاولة بعد شوي",
};

export const getDeleteError = (status) =>
  DELETE_ERRORS[status] || DELETE_ERRORS.DEFAULT;

// هنا رسالة لكل رد من الباك على تغيير كلمة المرور
export const PASSWORD_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: "كلمة المرور الجديدة ما تناسب الشروط",
  [HTTP_STATUS.UNAUTHORIZED]: "كلمة المرور الحالية غير صحيحة",
  [HTTP_STATUS.NOT_FOUND]: NOT_READY_MESSAGE,
  405: NOT_READY_MESSAGE,
  NETWORK: "الإنترنت فصل في نص الطريق، نرجو التأكد منه",
  DEFAULT: "الخلل عندنا مو عندك، نرجو المحاولة بعد شوي",
};

export const getPasswordError = (status) =>
  PASSWORD_ERRORS[status] || PASSWORD_ERRORS.DEFAULT;
