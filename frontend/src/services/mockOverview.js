// بيانات وهمية للـداشبورد لحين ربط الباك إند
export const MOCK_OVERVIEW = Object.freeze({
  supplier: {
    id: 1,
    business_name: "موارد الرياض",
  },
  stats: {
    new_orders: 4,
    month_sales: 18420,
    available_products: 24,
    total_products: 27,
  },
  orders: [
    {
      id: "MK-2048",
      customer: "معمول نورة",
      district: "حي النرجس",
      items_count: 3,
      total: 1200,
      status: "preparing",
    },
    {
      id: "MK-2047",
      customer: "حلويات سارة",
      district: "حي الياسمين",
      items_count: 1,
      total: 475,
      status: "new",
    },
  ],
});