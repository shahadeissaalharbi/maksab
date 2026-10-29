// هنا رد مؤقت بنفس شكل /api/supplier/home، نستخدمه لين ينتشر الرابط
export const MOCK_SUPPLIER_HOME = Object.freeze({
  supplier: { id: 1, name: "مستودع الخير", business_name: "مستودع الخير للجملة" },
  total_products: 6,
  products: [
    { id: 1, name: "علب كرتون للحلا", price: "70.00", stock_status: "in_stock" },
    { id: 2, name: "أكياس ورقية بمقبض", price: "55.00", stock_status: "in_stock" },
    { id: 3, name: "شريط ساتان للتغليف", price: "42.00", stock_status: "out_of_stock" },
    { id: 4, name: "علب شفافة ٥٠٠ مل", price: "38.00", stock_status: "in_stock" },
    { id: 5, name: "ملصقات دائرية", price: "65.00", stock_status: "in_stock" },
    { id: 6, name: "صواني تقديم ذهبية", price: "60.00", stock_status: "out_of_stock" },
  ],
});