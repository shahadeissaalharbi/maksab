// هنا طلبات مؤقتة، نستخدمها لين يجهز رابط الطلبات في الباك
export const MOCK_MY_ORDERS = {
  orders: [
    {
      id: "MK-2048",
      created_at: "2026-03-12",
      status: "preparing",
      supplier_name: "شركة موارد الرياض للتجارة",
      items_summary: "سكر ناعم، علب كرتون للحلا، ملصقات دائرية",
      total: 1200,
    },
    {
      id: "MK-2031",
      created_at: "2026-03-05",
      status: "shipped",
      supplier_name: "مستودع الخير للجملة",
      items_summary: "دقيق أبيض فاخر، معجون تمر سكري",
      total: 435,
    },
    {
      id: "MK-1972",
      created_at: "2026-02-28",
      status: "delivered",
      supplier_name: "مؤسسة تغليف نجد",
      items_summary: "علب كرتون للحلا",
      total: 210,
    },
  ],
};
