import { ROUTES } from "./routes.js";

// هنا حالات تحميل المنتجات
export const LOAD_STATUS = {
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
};

// هنا نصوص صفحة السوق في مكان واحد
export const MARKET_TEXT = {
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
};

// هنا خيارات الترتيب ونصوص الفلاتر
export const SORT_OPTIONS = {
  DEFAULT: "default",
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  NAME: "name",
};

export const FILTER_TEXT = {
  PRICE_LABEL: "السعر (ر.س)",
  PRICE_FROM: "من",
  PRICE_TO: "إلى",
  SORT_LABEL: "الترتيب",
  RESET: "مسح الفلاتر",
  SORT: {
    [SORT_OPTIONS.DEFAULT]: "افتراضي",
    [SORT_OPTIONS.PRICE_ASC]: "السعر: الأقل أول",
    [SORT_OPTIONS.PRICE_DESC]: "السعر: الأعلى أول",
    [SORT_OPTIONS.NAME]: "الاسم",
  },
};

// هنا روابط الشريط العلوي، وكل رابط يودي لصفحته، واللي عليها soon صفحتها «قريبًا»
export const NAV_LINKS = [
  { label: "الرئيسية", to: ROUTES.LANDING },
  { label: "حاسبة التسعير", to: ROUTES.CALCULATOR },
  { label: "سوق الجملة", to: ROUTES.TRADER_HOME },
  { label: "طلباتي", to: ROUTES.MY_ORDERS },
  { label: "أكاديمية مكسب", to: ROUTES.ACADEMY, soon: true },
  { label: "دليل الشركاء", to: ROUTES.PARTNERS, soon: true },
];

// هنا روابط شريط المورد
export const SUPPLIER_NAV_LINKS = [
  { label: "لوحة المورد", to: ROUTES.SUPPLIER_HOME },
];

// هنا نصوص الصفحات اللي لسا ما انبنت
export const COMING_SOON_TEXT = {
  BADGE: "قريبًا",
  MESSAGE: "نطبخها على نار هادية… وقريب تجهز",
  BACK: "العودة لسوق الجملة",
};

// هنا صفحات «قريبًا» للأسر: عنوان كل صفحة وجملة عن وش بتقدم
export const COMING_SOON_PAGES = {
  ACADEMY: {
    title: "أكاديمية مكسب",
    note: "تدريب عملي للأسر المنتجة، يساعد مشروعكم يكبر خطوة خطوة",
  },
  PARTNERS: {
    title: "دليل الشركاء",
    note: "الخدمات المهنية اللي تحتاجها الأسر المنتجة، في مكان واحد",
  },
};
