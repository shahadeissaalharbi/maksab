import { ROUTES } from "./routes.js";

// حالات التحميل لصفحة النظرة العامة
export const OVERVIEW_LOAD = Object.freeze({
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
});

// هنا حالات الطلب، و value نفس اللي يرجعه الباك
export const ORDER_STATUS = Object.freeze({
  NEW: Object.freeze({ value: "new", label: "طلب جديد" }),
  PREPARING: Object.freeze({ value: "preparing", label: "قيد التجهيز" }),
  SHIPPED: Object.freeze({ value: "shipped", label: "تم الشحن" }),
  DELIVERED: Object.freeze({ value: "delivered", label: "تم التسليم" }),
});

// هنا الحالات كقائمة، عشان القائمة المنسدلة
export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS);

// هنا روابط القائمة الجانبية، واللي ما له رابط يطلع "قريبًا"
export const NAV_ITEMS = [
  { id: "overview", label: "نظرة عامة", to: ROUTES.SUPPLIER_HOME },
  { id: "products", label: "المنتجات والمخزون", to: ROUTES.SUPPLIER_PRODUCTS },
  { id: "orders", label: "الطلبات الواردة", to: null },
  { id: "messages", label: "الرسائل", to: null },
];

// هنا كل نصوص النظرة العامة في مكان واحد
export const OVERVIEW_TEXT = Object.freeze({
  ACCOUNT_TYPE: "حساب المورد",
  SOON: "قريبًا",
  BACK_TO_PLATFORM: "العودة للمنصة",
  GOOD_MORNING: "صباح الخير",
  GOOD_EVENING: "مساء الخير",
  greeting: (salutation, name) => `${salutation}، ${name}`,
  newOrdersNotice: (count) => `لديك ${count} طلبات جديدة تحتاج مراجعة`,
  ADD_PRODUCT: "+ إضافة منتج جديد",
  STAT_SALES: "مبيعات هذا الشهر",
  STAT_NEW_ORDERS: "طلبات جديدة",
  STAT_NEW_ORDERS_HINT: "تحتاج مراجعة",
  STAT_PRODUCTS: "منتجات متوفرة",
  productsOf: (total) => `من ${total} منتج`,
  ORDERS_EYEBROW: "إدارة الطلبات",
  ORDERS_TITLE: "أحدث الطلبات الواردة",
  VIEW_ALL_ORDERS: "عرض جميع الطلبات",
  itemsCount: (count) => `${count} منتج`,
  STATUS_LABEL: "حالة الطلب",
  ACTION_REVIEW: "مراجعة الطلب",
  ACTION_DETAILS: "تفاصيل الطلب",
  CURRENCY: "ر.س",
  DELIVERY_TITLE: "مسؤولية التوصيل",
  DELIVERY_BODY: "نرجو تجهيز الطلب وتسليمه على العنوان المحدد في تفاصيله.",
  LOADING: "جاري تحميل لوحتك...",
  ERROR: "ما قدرنا نجيب بياناتك، نرجو المحاولة بعد شوي",
});