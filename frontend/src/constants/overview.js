import { ROUTES } from "./routes.js";

export const OVERVIEW_LOAD = Object.freeze({
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
});

export const ORDER_STATUS = Object.freeze({
  NEW: Object.freeze({ value: "new", label: "طلب جديد" }),
  PREPARING: Object.freeze({ value: "preparing", label: "قيد التجهيز" }),
  SHIPPED: Object.freeze({ value: "shipped", label: "تم الشحن" }),
  DELIVERED: Object.freeze({ value: "delivered", label: "تم التسليم" }),
});

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS);

//روابط القائمة الجانبيةا
export const NAV_ITEMS = [
  { id: "overview", label: "نظرة عامة", to: ROUTES.SUPPLIER_HOME },
  { id: "products", label: "المنتجات والمخزون", to: ROUTES.SUPPLIER_PRODUCTS },
  { id: "orders", label: "الطلبات الواردة", to: null },
  { id: "business", label: "بيانات النشاط", to: ROUTES.BUSINESS_INFO },
  { id: "messages", label: "الرسائل", to: null },
];

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

// هنا ترتيب حالات الطلب في الواجهة، من أول خطوة لآخر خطوة
export const ORDER_STATUS_FLOW = Object.freeze(
  ORDER_STATUS_OPTIONS.map((option) => option.value),
);

// هنا اسم الحالة عند الباك لكل حالة في الواجهة
export const BACKEND_STATUS = Object.freeze({
  new: "pending",
  preparing: "processing",
  shipped: "shipped",
  delivered: "delivered",
});

// وهنا العكس: الحالة اللي جاية من الباك وش تصير في الواجهة
export const UI_STATUS = Object.freeze({
  pending: "new",
  paid: "new",
  processing: "preparing",
  shipped: "shipped",
  delivered: "delivered",
});

// هنا رسالة لكل رد من الباك على تغيير الحالة
export const STATUS_ERRORS = Object.freeze({
  401: "انتهت جلستك، نرجو تسجيل الدخول من جديد",
  403: "هذا الطلب مو لحسابك",
  404: "الطلب ما عاد موجود",
  409: "الحالة تتغير خطوة خطوة، اختاروا الخطوة اللي بعدها",
  NETWORK: "الإنترنت فصل في نص الطريق، نرجو التأكد منه",
  DEFAULT: "الحالة ما انحفظت، نرجو المحاولة بعد شوي",
});

export const getStatusError = (status) =>
  STATUS_ERRORS[status] || STATUS_ERRORS.DEFAULT;
