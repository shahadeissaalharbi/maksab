// هنا حدود الحاسبة ومثال جاهز
export const CALCULATOR_LIMITS = {
  MAX_MARGIN: 99,
  DEFAULT_MARGIN: "30",
  VERIFY_DELAY_MS: 600,
};

export const EMPTY_PRICING = {
  material: "",
  packaging: "",
  hours: "",
  hourlyRate: "",
  quantity: "",
  margin: CALCULATOR_LIMITS.DEFAULT_MARGIN,
};

// هنا مثال للتجربة: كيك لـ 20 قطعة
export const EXAMPLE_PRICING = {
  material: "120",
  packaging: "30",
  hours: "3",
  hourlyRate: "25",
  quantity: "20",
  margin: "30",
};

// هنا خانات الإدخال: الاسم في الكود، والعنوان، والوحدة
export const PRICING_FIELDS = [
  { name: "material", label: "تكلفة المواد", hint: "كل المكونات لهالكمية", unit: "ر.س" },
  { name: "packaging", label: "تكلفة التغليف", hint: "علب وأكياس وملصقات", unit: "ر.س" },
  { name: "hours", label: "ساعات العمل", hint: "كم ساعة تاخذ كل الكمية", unit: "ساعة" },
  { name: "hourlyRate", label: "أجرة الساعة", hint: "سعر ساعة عملك", unit: "ر.س" },
  { name: "quantity", label: "عدد القطع", hint: "كم قطعة تطلع من هالكمية", unit: "قطعة" },
];

// هنا نصوص الحاسبة في مكان واحد
export const CALCULATOR_TEXT = {
  EYEBROW: "حاسبة التسعير",
  TITLE: "كم لازم يكون سعر البيع؟",
  SUBTITLE: "التكاليف ونسبة الربح هنا، والسعر المقترح يطلع لحاله.",
  INPUTS_TITLE: "التكاليف",
  MARGIN_LABEL: "نسبة الربح المطلوبة",
  MARGIN_HINT: "من سعر البيع",
  EXAMPLE: "مثال جاهز للتجربة",
  CLEAR: "مسح الخانات",
  RESULT_TITLE: "السعر المقترح",
  PER_UNIT: "للقطعة الواحدة",
  EMPTY_RESULT: "السعر المقترح يطلع هنا أول ما تتعبى الخانات",
  COST_PER_UNIT: "تكلفة القطعة",
  PROFIT_PER_UNIT: "الربح من القطعة",
  TOTAL_COST: "إجمالي التكلفة",
  TOTAL_PROFIT: "إجمالي الربح",
  BREAKDOWN_TITLE: "وين تروح التكلفة",
  MATERIAL: "المواد",
  PACKAGING: "التغليف",
  LABOR: "العمل",
  FORMULA: "السعر = تكلفة القطعة ÷ (1 − نسبة الربح)",
  VERIFIED: "تم التحقق من الخادم ✓",
  CURRENCY: "ر.س",
};

export const PRICING_ERRORS = {
  REQUIRED: "نرجو كتابة رقم",
  NEGATIVE: "الرقم لازم يكون صفر أو أكثر",
  QUANTITY: "العدد لازم يكون أكبر من صفر",
  MARGIN: "النسبة بين 0 و99",
};