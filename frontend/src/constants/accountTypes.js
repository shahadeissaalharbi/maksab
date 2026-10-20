// هنا أنواع الحسابات، وأي نوع جديد ينضاف من هنا بس
export const ACCOUNT_TYPES = Object.freeze({
  MERCHANT: Object.freeze({
    value: "merchant",
    label: "أسرة منتجة",
    description: "أبحث عن المواد والتغليف بالجملة",
    placeholder: "مثال: شعبيات نجدية",
  }),
  SUPPLIER: Object.freeze({
    value: "supplier",
    label: "مورد",
    description: "أعرض منتجات الجملة وأدير الطلبات",
    placeholder: "مثال: مستودع الخير للجملة",
  }),
});

// هنا الأنواع كقائمة عشان أمر عليها، مثل البطاقات في صفحة التسجيل
export const ACCOUNT_TYPES_ARRAY = Object.freeze([
  ACCOUNT_TYPES.MERCHANT,
  ACCOUNT_TYPES.SUPPLIER,
]);

// هنا النوع المختار أول ما تفتح صفحة التسجيل
export const DEFAULT_ACCOUNT_TYPE = ACCOUNT_TYPES.MERCHANT;

// هنا أحول القيمة اللي يرجعها الباك لاسم يفهمه المستخدم
export const getAccountTypeLabel = (value) =>
  ACCOUNT_TYPES_ARRAY.find((type) => type.value === value)?.label ?? "";