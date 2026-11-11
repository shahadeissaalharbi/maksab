// هنا كل ثوابت الخريطة وموقع التوصيل في مكان واحد

// هنا مفتاح خرائط Google ورقم الخريطة من متغيرات البيئة (ما ينكتبون في الكود)
export const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
export const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || "DEMO_MAP_ID";

// هنا قرب الخريطة لما نعرض نقطة
export const MAP_ZOOM = 15;

// هنا نقطة تعرضها الخريطة قبل ما يختار المستخدم موقعه (وسط الرياض)
export const DEFAULT_POINT = { latitude: 24.7136, longitude: 46.6753 };

// هنا كم ننتظر موقع الجهاز قبل ما نقول ما قدرنا
export const LOCATE_TIMEOUT_MS = 10000;

// هنا رابط خريطة Google المضمنة لنقطة معينة (تنعرض لو المفتاح ما انضبط)
export const embedUrl = ({ latitude, longitude }) =>
  `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${latitude},${longitude}!6i${MAP_ZOOM}`;

// هنا رابط يفتح النقطة في خرائط Google
export const openInMapsUrl = ({ latitude, longitude }) =>
  `https://www.google.com/maps?q=${latitude},${longitude}`;

// هنا حالات زر «موقعي الحالي»
export const LOCATE_STATE = {
  IDLE: "idle",
  LOCATING: "locating",
  DENIED: "denied",
  FAILED: "failed",
};

// هنا كل نصوص قسم موقع التوصيل
export const LOCATION_TEXT = {
  TITLE: "موقع التوصيل",
  NOTE: "حدد موقعك مرة وحدة عشان يوصلك طلبك، والتوصيل مجاني",
  MAP_HINT: "اضغط على الخريطة أو اسحب الدبوس لمكانك بالضبط",
  USE_CURRENT: "استخدم موقعي الحالي",
  LOCATING: "جاري تحديد موقعك...",
  PASTE_LABEL: "أو الصق رابط موقعك من خرائط Google",
  PASTE_PLACEHOLDER: "https://www.google.com/maps/...",
  PASTE_APPLY: "تطبيق",
  PASTE_INVALID: "ما قدرنا نقرأ الموقع من الرابط، افتح الموقع في خرائط Google وانسخ الرابط من شريط المتصفح",
  DENIED: "ما سمح المتصفح بمعرفة موقعك، اسمح له من إعدادات المتصفح أو الصق رابط موقعك",
  FAILED: "ما قدرنا نحدد موقعك الحين، جرب مرة ثانية أو الصق رابط موقعك",
  NOT_SET: "ما حددت موقعك للحين",
  SAVE: "حفظ الموقع",
  SAVING: "جاري الحفظ...",
  SAVED: "انحفظ موقعك ✓",
  SAVE_ERROR: "ما قدرنا نحفظ الموقع، جرب مرة ثانية",
  OPEN_IN_MAPS: "افتح في خرائط Google",
  MAP_TITLE: "موقعك على الخريطة",
};

// هنا نصوص تنبيه التوصيل في السلة
export const DELIVERY_NOTICE_TEXT = {
  FREE: "🚚 التوصيل مجاني لموقعك المحفوظ",
  NEEDS_LOCATION: "حدد موقعك قبل الدفع عشان يوصلك الطلب",
  SET_LOCATION: "حدد موقعك",
  CHANGE: "تغيير الموقع",
};