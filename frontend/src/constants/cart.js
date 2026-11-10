// هنا مفتاح حفظ السلة في المتصفح، عشان ما تروح مع تحديث الصفحة
export const CART_STORAGE_KEY = "maksab-cart";

// هنا لو المنتج ما له مخزون مكتوب (بيانات مؤقتة) ما نحدد له حد أعلى
export const NO_STOCK_LIMIT = 9999;

// هنا كلام السلة في مكان واحد
export const CART_TEXT = {
  TITLE: "سلتي",
  NAV_LABEL: "السلة",
  ADDED: "تمت الإضافة ✓",
  OUT_OF_STOCK: "نفد من المخزون",
  CLOSE: "إغلاق",
  // هنا تنبيه الحد: المتوفر أو أقل كمية للطلب
  LIMIT_STOCK: (name, stock) =>
    stock > 0 ? `${name}: المتوفر ${stock} فقط` : `${name}: نفد من المخزون`,
  LIMIT_MOQ: (name, moq) => `${name}: أقل كمية للطلب ${moq}`,
  EMPTY: "السلة فاضية، وسوق الجملة بانتظارك",
  BACK_TO_MARKET: "الرجوع لسوق الجملة",
  SUPPLIER: "المورد",
  MIN_ORDER: "أقل طلب",
  REMOVE: "حذف",
  SUBTOTAL: "مجموع المورد",
  TOTAL: "إجمالي السلة",
  CURRENCY: "ر.س",
  SPLIT_NOTE: "كل مورد له طلب مستقل، والتوصيل مسؤولية المورد",
  CHECKOUT: "إتمام الطلب",
  CHECKING_OUT: "جاري إرسال الطلب...",
  PLACED: "تم إرسال طلبك ✓ والمورد بيتواصل معك لتأكيد الموعد",
};

// هنا رسالة لكل رد من الباك على إنشاء الطلب
export const ORDER_ERRORS = {
  400: "الكمية أقل من أقل طلب لأحد المنتجات، نرجو مراجعة السلة",
  401: "انتهت جلستك، نرجو تسجيل الدخول من جديد",
  403: "الطلب متاح للأسر المنتجة بس",
  404: "أحد المنتجات ما عاد متوفر، نرجو حذفه من السلة",
  409: "الكمية المطلوبة أكثر من المتوفر عند المورد، نرجو تقليلها",
  NETWORK: "الإنترنت فصل في نص الطريق، نرجو التأكد منه",
  DEFAULT: "الطلب ما انرسل، نرجو المحاولة بعد شوي",
};

export const getOrderError = (status) =>
  ORDER_ERRORS[status] || ORDER_ERRORS.DEFAULT;

// هنا الرموز اللي يرجعها الباك لما الكمية ما تناسب
export const ORDER_ERROR_CODES = {
  INSUFFICIENT_STOCK: "insufficient_stock",
  BELOW_MIN_ORDER: "below_min_order",
};

// هنا لو الباك رجع الرمز نعرض اسم المنتج والرقم، وإلا رسالة رقم الرد
export function getOrderErrorMessage(status, data) {
  if (data?.code === ORDER_ERROR_CODES.INSUFFICIENT_STOCK) {
    return CART_TEXT.LIMIT_STOCK(data.product_name, data.available);
  }
  if (data?.code === ORDER_ERROR_CODES.BELOW_MIN_ORDER) {
    return CART_TEXT.LIMIT_MOQ(data.product_name, data.min_order);
  }
  return getOrderError(status);
}
