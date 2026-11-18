// هنا روابط نموذج ميسّر ثبّتت يبنات النسخة عشان ما يتغير علينا شي
export const MOYASAR_FORM = {
  SCRIPT_URL: "https://cdn.moyasar.com/mpf/1.15.0/moyasar.js",
  STYLE_URL: "https://cdn.moyasar.com/mpf/1.15.0/moyasar.css",
  ELEMENT: ".mysr-form",
  METHODS: ["creditcard"],
  NETWORKS: ["mada", "visa", "mastercard"],
  LANGUAGE: "ar",
};

// هنا حالات الفاتورة مثل جدول checkouts
export const CHECKOUT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export const FORM_STATE = {
  LOADING: "loading",
  READY: "ready",
  FAILED: "failed",
};

export const RESULT_STATE = {
  CHECKING: "checking",
  PAID: "paid",
  FAILED: "failed",
  WAITING: "waiting",
};

// هنا أسأل الباك 5 مرات، بين كل مرة ثانيتين
export const RESULT_CHECK = {
  TRIES: 5,
  EVERY_MS: 2000,
};

// هنا الحالة اللي ميسّر يحطها بالرابط لما يفشل الدفع
export const MOYASAR_FAILED = "failed";

export const CHECKOUT_STORAGE_KEY = "maksab-checkout";

// هنا خطوات الدفع ورقم الخطوة الحالية في كل صفحة
export const PAYMENT_STEPS = ["السلة", "الدفع", "التأكيد"];
export const STEP = { PAYMENT: 1, RESULT: 2 };

export const PAYMENT_TEXT = {
  TITLE: "الدفع",
  SUBTITLE: "خطوة أخيرة وطلبك يوصل للموردين",
  TOTAL: "المبلغ المطلوب",
  SECURE: "دفع آمن عن طريق ميسّر",
  CURRENCY: "ر.س",
  LOADING: "جاري تجهيز الدفع...",
  FORM_FAILED: "تعذر فتح نموذج الدفع، الرجاء تحديث الصفحة",
  NO_KEY: "الدفع غير متاح حاليًا، الرجاء المحاولة لاحقًا",
  BACK_TO_CART: "الرجوع للسلة",
  CHECKING: "جاري التأكد من الدفع...",
  PAID_TITLE: "تم الدفع",
  PAID_TEXT: "طلبك وصل للموردين، وحالته تطلع في صفحة طلباتي",
  FAILED_TITLE: "لم يتم الدفع",
  FAILED_TEXT: "لم يُخصم أي مبلغ، الرجاء الرجوع للسلة والمحاولة مرة أخرى",
  WAITING_TITLE: "الدفع قيد التأكيد",
  WAITING_TEXT: "تأكيد البنك قد يتأخر قليلًا، وحالة الطلب تتحدث في صفحة طلباتي",
  MY_ORDERS: "طلباتي",
};
