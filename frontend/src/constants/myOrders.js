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

// هنا شكل كل حالة من جهة الأسرة المنتجة، و value نفس اللي في overview.js
export const MY_ORDER_STATUS = {
  new: { label: "بانتظار المورد", tone: "gray" },
  preparing: { label: "قيد التجهيز لدى المورد", tone: "yellow" },
  shipped: { label: "في الطريق", tone: "blue" },
  delivered: { label: "تم التسليم بواسطة المورد", tone: "green" },
};

// هنا روابط القائمة الجانبية، واللي ما له رابط يطلع "قريبًا"
export const ACCOUNT_LINKS = [
  { id: "orders", label: "طلباتي وإيصالاتي", to: ROUTES.MY_ORDERS },
  { id: "business", label: "بيانات النشاط والعنوان", to: ROUTES.BUSINESS_INFO },
  { id: "messages", label: "رسائل الموردين", to: null },
  { id: "switch", label: "الانتقال لحساب المورد", to: null },
];
