// هنا منتجات مؤقتة بنفس شكل رد الباك، نستخدمها لين يجهز رابط التاجر
export const MOCK_PRODUCTS = [
  { id: 1, image_url: "/products/sugar.svg", name: "سكر ناعم", price: "185.00", unit: "كيس ٥٠ كجم", moq: 5, supplier_name: "مستودع الخير", category: { type: "raw_material" } },
  { id: 2, image_url: "/products/flour.svg", name: "دقيق أبيض فاخر", price: "120.00", unit: "كيس ٤٥ كجم", moq: 5, supplier_name: "مطاحن نجد", category: { type: "raw_material" } },
  { id: 3, image_url: "/products/dates.svg", name: "معجون تمر سكري", price: "95.00", unit: "كرتون ١٠ كجم", moq: 10, supplier_name: "تمور القصيم", category: { type: "raw_material" } },
  { id: 4, image_url: "/products/paper-bags.svg", name: "أكياس ورقية بمقبض", price: "55.00", unit: "١٠٠ كيس", moq: 2, supplier_name: "عالم التغليف", category: { type: "packaging" } },
  { id: 5, image_url: "/products/ribbon.svg", name: "شريط ساتان للتغليف", price: "42.00", unit: "٢٠ لفة", moq: 2, supplier_name: "عالم التغليف", category: { type: "packaging" } },
  { id: 6, image_url: "/products/stickers.svg", name: "ملصقات دائرية بشعارك", price: "65.00", unit: "٥٠٠ ملصق", moq: 1, supplier_name: "مطبعة الرياض", category: { type: "packaging" } },
  { id: 7, image_url: "/products/cake-boxes.svg", name: "علب كرتون للحلا", price: "70.00", unit: "١٠٠ علبة", moq: 3, supplier_name: "مصنع العلب", category: { type: "containers" } },
  { id: 8, image_url: "/products/clear-cups.svg", name: "علب شفافة ٥٠٠ مل", price: "38.00", unit: "٥٠ علبة", moq: 4, supplier_name: "مصنع العلب", category: { type: "containers" } },
];