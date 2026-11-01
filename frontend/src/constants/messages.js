export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

// هنا نوع الرسالة اللي تطلع تحت الزر، وهو نفس اسم الكلاس في CSS
export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
};

// هنا كل رد خطأ من الباك مربوط برسالته
export const ERROR_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: "فيه معلومة ناقصة، نرجو مراجعتها",
  [HTTP_STATUS.UNAUTHORIZED]: "البريد أو كلمة المرور غير صحيحة",
  [HTTP_STATUS.FORBIDDEN]: "خطوة أخيرة: رمز التحقق ينتظرك في بريدك",
  [HTTP_STATUS.CONFLICT]:
    "يامرحبا! هذا البريد له حساب عندنا، تسجيل الدخول أسرع",
  NETWORK: "الإنترنت فصل في نص الطريق، نرجو التأكد منه",
  DEFAULT: "الخلل عندنا مو عندك، نرجو المحاولة بعد شوي",
};

// هنا رسائل النجاح، ورسالة الدخول دالة لأن فيها اسم المستخدم ونوع حسابه
export const SUCCESS_MESSAGES = {
  // لما ينزل التوثيق على Railway، أرجعها لرسالة "رابط التوثيق في بريدك"
  REGISTER: "أهلًا في مكسب! حسابك جاهز، تسجيل الدخول من هنا",
  LOGIN: (name, accountLabel) =>
    `أهلًا ${name}، تم تسجيل دخولك كـ ${accountLabel}`,
};

// هنا أجيب رسالة الخطأ من رقم الرد، وإذا ما لقيته أرجع الرسالة العامة
export const getErrorMessage = (status) =>
  ERROR_MESSAGES[status] || ERROR_MESSAGES.DEFAULT;

// هنا كلام شاشة رابط التوثيق
export const VERIFY_TEXT = {
  SUBTITLE: "باقي خطوة وحدة",
  TITLE: "رمز التحقق في بريدك",
  SENT_TO: "أرسلنا رمز من 6 أرقام إلى",
  HINT: "نرجو كتابة الرمز هنا. وإذا ما وصل، نرجو التأكد من الرسائل غير المرغوبة.",
  CODE_LABEL: "رمز التحقق",
  CONFIRM: "تأكيد الرمز",
  CONFIRMING: "جاري التأكد...",
  RESEND: "إرسال رمز جديد",
  WAIT: "إرسال رمز جديد متاح بعد",
  RESENT: "إذا الحساب يحتاج توثيق، بيوصلك رمز جديد",
  BACK: "الإيميل غلط؟ رجوع للتسجيل",
  VERIFIED: "تم توثيق بريدك ✓ تسجيل الدخول من هنا",
};

// هنا رسائل أخطاء رمز التحقق حسب رد الباك
export const OTP_ERRORS = {
  400: "الرمز غير صحيح، نرجو التأكد منه",
  410: "انتهت صلاحية الرمز، نرجو طلب رمز جديد",
  429: "محاولات كثيرة، نرجو طلب رمز جديد",
};
