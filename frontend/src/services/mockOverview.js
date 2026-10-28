// هنا رد مؤقت للنظرة العامة، نستخدمه لين يجهز رابط الباك
export const MOCK_OVERVIEW = {
  supplier: { id: 1, business_name: "موارد الرياض" },
  stats: {
    new_orders: 2,
    month_sales: 18420,
    available_products: 24,
    total_products: 27,
  },
  orders: [
    { id: "MK-2048", customer: "معمول نورة", district: "حي النرجس", items_count: 3, total: 1200, status: "new" },
    { id: "MK-2047", customer: "حلويات سارة", district: "حي الياسمين", items_count: 1, total: 475, status: "new" },
    { id: "MK-2046", customer: "مخبز البيت", district: "حي الملقا", items_count: 5, total: 2310, status: "preparing" },
    { id: "MK-2045", customer: "قهوة أم فهد", district: "حي العليا", items_count: 2, total: 640, status: "shipped" },
  ],
};
