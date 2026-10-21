// هنا أرقام الردود اللي نتعامل معها من الباك
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
});

// هنا نوع الرسالة اللي تطلع تحت الزر، وهو نفس اسم الكلاس في CSS
export const MESSAGE_TYPES = Object.freeze({
  SUCCESS: "success",
  ERROR: "error",
});

// هنا كل رد خطأ من الباك مربوط برسالته
export const ERROR_MESSAGES = Object.freeze({
  [HTTP_STATUS.BAD_REQUEST]: "تأكدي من البيانات وحاولي مرة ثانية",
  [HTTP_STATUS.UNAUTHORIZED]: "الإيميل أو كلمة المرور غلط",
  [HTTP_STATUS.CONFLICT]: "هذا الإيميل مسجل من قبل، جربي تسجلين دخول",
  NETWORK: "ما قدرنا نوصل للخادم، تأكدي من اتصالك بالنت",
  DEFAULT: "صار خطأ في الخادم، حاولي بعد شوي",
});

// هنا رسائل النجاح، ورسالة الدخول دالة لأن فيها اسم المستخدم ونوع حسابه
export const SUCCESS_MESSAGES = Object.freeze({
  REGISTER: "تم إنشاء حسابك بنجاح، جاري تحويلك لتسجيل الدخول",
  LOGIN: (name, accountLabel) => `أهلًا ${name}، تم تسجيل دخولك كـ ${accountLabel}`,
});

// هنا أجيب رسالة الخطأ من رقم الرد، وإذا ما لقيته أرجع الرسالة العامة
export const getErrorMessage = (status) => ERROR_MESSAGES[status] ?? ERROR_MESSAGES.DEFAULT;