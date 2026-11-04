import { ROUTES } from "./routes.js";

// هنا كلام صفحة طلباتي
export const MY_ORDERS_TEXT = {
  EYEBROW: "حسابي",
  TITLE: "طلباتي",
  NEW_ORDER: "طلب جديد",
  SIDEBAR_TITLE: "إدارة الحساب",
  SOON: "قريبًا",
  ORDER_NO: "طلب رقم",
  CURRENCY: "ر.س",
  DELIVERY_NOTE: "المورد مسؤول عن التوصيل، ويتواصل معك لتأكيد الموعد",
  RECEIPT: "تحميل إيصال الدفع",
  EMPTY: "ما فيه طلبات للحين، وسوق الجملة بانتظارك",
  LOADING: "جاري تحميل طلباتك...",
  ERROR: "طلباتك ما وصلت هالمرة، نرجو المحاولة بعد شوي",
};

// هنا شكل كل حالة من جهة الأسرة المنتجة. فوق حالات الباك، وتحت حالات البيانات المؤقتة، و value نفس اللي في overview.js
export const MY_ORDER_STATUS = {
  pending: { label: "بانتظار المورد", tone: "gray" },
  paid: { label: "تم الدفع", tone: "green" },
  processing: { label: "قيد التجهيز لدى المورد", tone: "yellow" },
  shipped: { label: "في الطريق", tone: "blue" },
  delivered: { label: "تم التسليم بواسطة المورد", tone: "green" },
  cancelled: { label: "ملغي", tone: "red" },
  new: { label: "بانتظار المورد", tone: "gray" },
  preparing: { label: "قيد التجهيز لدى المورد", tone: "yellow" },
};

// هنا روابط القائمة الجانبية، واللي ما له رابط يطلع "قريبًا"
export const ACCOUNT_LINKS = [
  { id: "orders", label: "طلباتي وإيصالاتي", to: ROUTES.MY_ORDERS },
  { id: "business", label: "بيانات النشاط والعنوان", to: ROUTES.BUSINESS_INFO },
  { id: "messages", label: "رسائل الموردين", to: null },
  { id: "switch", label: "الانتقال لحساب المورد", to: null },
];

// هنا خطوات تتبع الطلب، من الاستلام لين التسليم
export const ORDER_TRACK_STEPS = [
  { id: "received", label: "تم استلام الطلب" },
  { id: "preparing", label: "قيد التجهيز" },
  { id: "shipped", label: "في الطريق" },
  { id: "delivered", label: "تم التسليم" },
];

// هنا كل حالة تقع في أي خطوة (ابتداء من 0)
export const ORDER_STEP_INDEX = {
  pending: 0,
  new: 0,
  paid: 0,
  processing: 1,
  preparing: 1,
  shipped: 2,
  delivered: 3,
};

// هنا تبويبات الطلبات، وكل حالة تتبع أي مجموعة
export const ORDER_FILTERS = [
  { id: "all", label: "الكل" },
  { id: "active", label: "جارية" },
  { id: "done", label: "مكتملة" },
  { id: "cancelled", label: "ملغاة" },
];

export const ORDER_GROUP = {
  pending: "active",
  new: "active",
  paid: "active",
  processing: "active",
  preparing: "active",
  shipped: "active",
  delivered: "done",
  cancelled: "cancelled",
};

export const ORDER_TRACK_TEXT = {
  CANCELLED: "تم إلغاء هذا الطلب",
  EMPTY_FILTER: "ما فيه طلبات في هالتبويب",
};
