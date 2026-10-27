import { ROUTES } from "./routes.js";

// هنا حالات تحميل المنتجات
export const LOAD_STATUS = Object.freeze({
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
});

// هنا نصوص صفحة السوق في مكان واحد
export const MARKET_TEXT = Object.freeze({
  BADGE: "سوق الجملة",
  TITLE: "موادك وتغليفك، مباشرة من موردين سعوديين",
  SEARCH_PLACEHOLDER: "سكر؟ علب؟ ملصقات؟ كل اللي يحتاجه مشروعك هنا",
  CATEGORY_TITLE: "التصنيف",
  LOADING: "جاري تحميل المنتجات...",
  EMPTY: "ما لقينا هالكلمة، كلمة أبسط يمكن تجيبها",
  ERROR: "المنتجات ما وصلت هالمرة، نرجو المحاولة بعد شوي",
  CURRENCY: "ر.س",
  MIN_ORDER: "أقل طلب",
  DETAILS: "عرض التفاصيل ومعلومات المورد",
  ADD_TO_CART: "إضافة للسلة",
  LOGOUT: "تسجيل الخروج",
  productsCount: (count) => `${count} منتج`,
});

// هنا روابط الشريط العلوي، وكل رابط يودي لصفحته
export const NAV_LINKS = Object.freeze([
  Object.freeze({ label: "الرئيسية", to: ROUTES.LANDING }),
  Object.freeze({ label: "حاسبة التسعير", to: ROUTES.CALCULATOR }),
  Object.freeze({ label: "سوق الجملة", to: ROUTES.TRADER_HOME }),
  Object.freeze({ label: "بيانات النشاط ", to: ROUTES.BUSINESS_INFO }),
]);

// هنا روابط شريط المورد
export const SUPPLIER_NAV_LINKS = Object.freeze([
  Object.freeze({ label: "لوحة المورد", to: ROUTES.SUPPLIER_HOME }),
]);

// هنا نصوص الصفحات اللي لسا ما انبنت
export const COMING_SOON_TEXT = Object.freeze({
  BADGE: "قريبًا",
  MESSAGE: "نطبخها على نار هادية… وقريب تجهز",
  BACK: "العودة لسوق الجملة",
});
