// هنا أرقام الردود اللي نتعامل معها من الباك
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  FORBIDDEN: 403,
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
  [HTTP_STATUS.FORBIDDEN]: "خطوة أخيرة: رابط التوثيق ينتظرك في بريدك",
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
