import { useState } from "react";
import { CATEGORIES } from "../constants/categories.js";

// هنا البحث والتصنيف، وتستخدمه صفحة التاجر وصفحة المورد
export function useProductFilters(products) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(CATEGORIES.ALL.value);

  // أعد كم منتج في كل تصنيف، عشان الرقم اللي جنب كل زر
  const counts = { [CATEGORIES.ALL.value]: products.length };
  for (const product of products) {
    const type = product.category?.type;
    if (type) {
      counts[type] = (counts[type] || 0) + 1;
    }
  }

  // أخلي بس المنتجات اللي تطابق التصنيف والبحث
  const filtered = products.filter((product) => {
    const matchCategory =
      category === CATEGORIES.ALL.value || product.category?.type === category;
    const matchSearch = product.name.includes(search.trim());
    return matchCategory && matchSearch;
  });

  return { search, setSearch, category, setCategory, counts, filtered };
}
