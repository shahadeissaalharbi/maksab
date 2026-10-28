// هنا أنواع الحسابات، وأي نوع جديد ينضاف من هنا بس
export const ACCOUNT_TYPES = {
  MERCHANT: {
    value: "merchant",
    label: "أسرة منتجة",
    description: "موادي وتغليفي بالجملة، بسعر يرفع مكسبي",
    placeholder: "مثال: شعبيات نجدية",
  },
  SUPPLIER: {
    value: "supplier",
    label: "مورد",
    description: "بضاعتي توصل لأسر منتجة في كل مكان",
    placeholder: "مثال: مستودع الخير للجملة",
  },
};

// هنا الأنواع كقائمة عشان أمر عليها، مثل البطاقات في صفحة التسجيل
export const ACCOUNT_TYPES_ARRAY = [
  ACCOUNT_TYPES.MERCHANT,
  ACCOUNT_TYPES.SUPPLIER,
];

// هنا النوع المختار أول ما تفتح صفحة التسجيل
export const DEFAULT_ACCOUNT_TYPE = ACCOUNT_TYPES.MERCHANT;

// هنا أحول القيمة اللي يرجعها الباك لاسم يفهمه المستخدم
export function getAccountTypeLabel(value) {
  const type = ACCOUNT_TYPES_ARRAY.find((item) => item.value === value);
  return type ? type.label : "";
}
