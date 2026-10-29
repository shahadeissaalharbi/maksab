import { HTTP_STATUS } from "./messages.js";

// هنا حالات المخزون، و value نفس اللي يرجعه الباك
export const STOCK_STATUS = Object.freeze({
  IN_STOCK: Object.freeze({ value: "in_stock", label: "متوفر", tone: "green" }),
  OUT_OF_STOCK: Object.freeze({ value: "out_of_stock", label: "نفد", tone: "red" }),
});

// هنا أجيب حالة المخزون من قيمتها، ولو ما لقيتها أعتبرها نفدت
export const getStockStatus = (value) =>
  Object.values(STOCK_STATUS).find((status) => status.value === value) ?? STOCK_STATUS.OUT_OF_STOCK;

// هنا نصوص لوحة المورد في مكان واحد
export const SUPPLIER_TEXT = Object.freeze({
  BADGE: "المنتجات والمخزون",
  greeting: (name) => `أهلًا ${name}`,
  SUBTITLE: "منتجاتك ومخزونك، تحت عينك",
  SEARCH_PLACEHOLDER: "البحث في منتجاتك...",
  STAT_TOTAL: "كل المنتجات",
  STAT_IN_STOCK: "متوفرة",
  STAT_OUT_OF_STOCK: "نفدت",
  LOADING: "جاري تحميل منتجاتك...",
  EMPTY: "ما عندك منتجات تطابق بحثك",
  ERROR: "منتجاتك ما وصلت هالمرة، نرجو المحاولة بعد شوي",
  CURRENCY: "ر.س",
  EDIT: "تعديل",
  SAVE: "حفظ",
  CANCEL: "إلغاء",
});

// هنا نصوص نافذة إضافة منتج
export const PRODUCT_FORM_TEXT = {
  EYEBROW: "إدارة المنتجات",
  TITLE: "إضافة منتج جديد",
  NAME: "اسم المنتج",
  NAME_PLACEHOLDER: "مثل: علب كرتون للحلا",
  DESCRIPTION: "تفاصيل المنتج",
  DESCRIPTION_PLACEHOLDER: "المقاس، الخامة، وأي تفصيل يهم المشتري",
  PRICE: "السعر",
  STOCK: "الكمية المتوفرة",
  STOCK_HINT: "عدد القطع الموجودة في المخزون الحين",
  UNIT: "الوحدة",
  UNIT_PLACEHOLDER: "مثل: كرتون ٥٠ علبة",
  MOQ: "أقل كمية للطلب",
  SUBMIT: "إضافة المنتج",
  SUBMITTING: "جاري الإضافة...",
  CANCEL: "إلغاء",
  CLOSE: "إغلاق",
  ADD_BUTTON: "+ إضافة منتج جديد",
};

// هنا رسائل إضافة وتعديل وحذف المنتجات
export const PRODUCT_MESSAGES = {
  ADDED: "انضاف المنتج ✓",
  UPDATED: "انحفظ السعر الجديد ✓",
  DELETED: "انحذف المنتج",
  DELETE: "حذف",
  DELETE_CONFIRM: "حذف المنتج نهائي وما يرجع، نكمل؟",
};

// هنا كل رد خطأ من الباك مربوط برسالته
export const PRODUCT_ERRORS = {
  [HTTP_STATUS.BAD_REQUEST]: "نرجو مراجعة البيانات: الاسم والسعر والكمية مطلوبة",
  [HTTP_STATUS.UNAUTHORIZED]: "انتهت الجلسة، نرجو تسجيل الدخول من جديد",
  [HTTP_STATUS.FORBIDDEN]: "ما فيه صلاحية: لازم حساب مورد موثق، والمنتج يكون منتجك",
  [HTTP_STATUS.NOT_FOUND]: "المنتج ما عاد موجود",
  NETWORK: "الإنترنت فصل في نص الطريق، نرجو المحاولة بعد شوي",
  DEFAULT: "الخلل عندنا مو عندك، نرجو المحاولة بعد شوي",
};

export const getProductError = (status) =>
  PRODUCT_ERRORS[status] || PRODUCT_ERRORS.DEFAULT;