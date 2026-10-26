// قائمة حالات الطلب
export const ORDER_STATUS = Object.freeze({
  NEW: Object.freeze({ value: "new", label: "طلب جديد" }),
  PREPARING: Object.freeze({ value: "preparing", label: "قيد التجهيز" }),
  SHIPPED: Object.freeze({ value: "shipped", label: "تم الشحن" }),
  DELIVERED: Object.freeze({ value: "delivered", label: "تم التسليم" }),
});

// قائمة الحالات القائمة المنسدلة
export const ORDER_STATUS_OPTIONS = Object.freeze(Object.values(ORDER_STATUS));

// زر الإجراء في كل طلب يتغير حسب حالته
export const ORDER_ACTION_LABEL = Object.freeze({
  [ORDER_STATUS.NEW.value]: "مراجعة الطلب",
  [ORDER_STATUS.PREPARING.value]: "تفاصيل العنوان والطلب",
  [ORDER_STATUS.SHIPPED.value]: "تفاصيل العنوان والطلب",
  [ORDER_STATUS.DELIVERED.value]: "تفاصيل العنوان والطلب",
});

// عناصر القائمة الجانبية
export const NAV_ITEMS = Object.freeze([
  Object.freeze({ id: "overview", label: "نظرة عامة" }),
  Object.freeze({ id: "products", label: "المنتجات والمخزون" }),
  Object.freeze({ id: "orders", label: "الطلبات الواردة" }),
  Object.freeze({ id: "messages", label: "الرسائل" }),
]);

// نصوص لوحة المورد في مكان واحد
export const OVERVIEW_TEXT = Object.freeze({
  BRAND: "مكسب",
  ACCOUNT_TYPE: "حساب المورد",
  BACK_TO_PLATFORM: "العودة للمنصة",
  GOOD_MORNING: "صباح الخير",
  GOOD_EVENING: "مساء الخير",
  greeting: (salutation, name) => `${salutation}، ${name}`,
  newOrdersNotice: (count) => `لديك ${count} طلبات جديدة تحتاج مراجعتك.`,
  PRODUCT_ADD: "+ إضافة منتج جديد",
  STAT_NEW_ORDERS: "طلبات جديدة",
  STAT_NEW_ORDERS_HINT: "تحتاج إجراء",
  STAT_MONTH_SALES: "مبيعات هذا الشهر",
  STAT_AVAILABLE_PRODUCTS: "منتجات متوفرة",
  availableOf: (total) => `من ${total} منتجاً`,
  ORDERS_EYEBROW: "إدارة الطلبات",
  TITLE_ORDERS: "أحدث الطلبات الواردة",
  VIEW_ALL_ORDERS: "عرض جميع الطلبات",
  productsCount: (n) => (n === 1 ? "1 منتج" : `${n} منتجات`),
  CURRENCY: "ر.س",
  DELIVERY_TITLE: "مسؤولية التوصيل",
  DELIVERY_BODY: "تنبيه للمورد: تأكد من تجهيز الطلب وتسليمه حسب العنوان المحدد في تفاصيل الطلب.",
  LOADING: "جاري تحميل لوحتك...",
  ERROR: "ما قدرنا نجيب بياناتك، حاول بعد شوي",
});

// حالات التحميل
export const OVERVIEW_LOAD = Object.freeze({
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
});