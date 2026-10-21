// هنا منتجات مؤقتة بنفس شكل رد الباك، نستخدمها لين يجهز رابط التاجر
export const MOCK_PRODUCTS = Object.freeze([
  { id: 1, name: "سكر ناعم", price: "185.00", unit: "كيس ٥٠ كجم", moq: 5, supplier_name: "مستودع الخير", category: { type: "raw_material" } },
  { id: 2, name: "دقيق أبيض فاخر", price: "120.00", unit: "كيس ٤٥ كجم", moq: 5, supplier_name: "مطاحن نجد", category: { type: "raw_material" } },
  { id: 3, name: "معجون تمر سكري", price: "95.00", unit: "كرتون ١٠ كجم", moq: 10, supplier_name: "تمور القصيم", category: { type: "raw_material" } },
  { id: 4, name: "أكياس ورقية بمقبض", price: "55.00", unit: "١٠٠ كيس", moq: 2, supplier_name: "عالم التغليف", category: { type: "packaging" } },
  { id: 5, name: "شريط ساتان للتغليف", price: "42.00", unit: "٢٠ لفة", moq: 2, supplier_name: "عالم التغليف", category: { type: "packaging" } },
  { id: 6, name: "ملصقات دائرية بشعارك", price: "65.00", unit: "٥٠٠ ملصق", moq: 1, supplier_name: "مطبعة الرياض", category: { type: "packaging" } },
  { id: 7, name: "علب كرتون للحلا", price: "70.00", unit: "١٠٠ علبة", moq: 3, supplier_name: "مصنع العلب", category: { type: "containers" } },
  { id: 8, name: "علب شفافة ٥٠٠ مل", price: "38.00", unit: "٥٠ علبة", moq: 4, supplier_name: "مصنع العلب", category: { type: "containers" } },
  { id: 9, name: "صواني تقديم ذهبية", price: "60.00", unit: "٢٥ صينية", moq: 2, supplier_name: "بيت المناسبات", category: { type: "containers" } },
]);