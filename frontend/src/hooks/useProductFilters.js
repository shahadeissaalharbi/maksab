import { useState } from "react";
import { CATEGORIES } from "../constants/categories.js";
import { SORT_OPTIONS } from "../constants/market.js";

// هنا أرتب المنتجات حسب اللي اختاره المستخدم، من غير ما أغير القائمة الأصلية
function sortProducts(products, sort) {
  const sorted = [...products];

  if (sort === SORT_OPTIONS.PRICE_ASC) {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === SORT_OPTIONS.PRICE_DESC) {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === SORT_OPTIONS.NAME) {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }

  return sorted;
}

// هنا البحث والتصنيف والسعر والترتيب، وتستخدمه صفحة التاجر وصفحة المورد
export function useProductFilters(products) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(CATEGORIES.ALL.value);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState(SORT_OPTIONS.DEFAULT);

  // أعد كم منتج في كل تصنيف، عشان الرقم اللي جنب كل زر
  const counts = { [CATEGORIES.ALL.value]: products.length };
  for (const product of products) {
    const type = product.category?.type;
    if (type) {
      counts[type] = (counts[type] || 0) + 1;
    }
  }

  // الخانة الفاضية معناها بدون حد
  const lowest = minPrice === "" ? 0 : Number(minPrice);
  const highest = maxPrice === "" ? Infinity : Number(maxPrice);

  // أخلي بس المنتجات اللي تطابق التصنيف والبحث والسعر
  const matching = products.filter((product) => {
    const matchCategory =
      category === CATEGORIES.ALL.value || product.category?.type === category;
    const matchSearch = product.name.includes(search.trim());
    const price = Number(product.price);
    const matchPrice = price >= lowest && price <= highest;
    return matchCategory && matchSearch && matchPrice;
  });

  const filtered = sortProducts(matching, sort);

  // هل فيه فلتر شغال؟ عشان يطلع زر المسح
  const hasFilters =
    category !== CATEGORIES.ALL.value ||
    search.trim() !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sort !== SORT_OPTIONS.DEFAULT;

  const reset = () => {
    setSearch("");
    setCategory(CATEGORIES.ALL.value);
    setMinPrice("");
    setMaxPrice("");
    setSort(SORT_OPTIONS.DEFAULT);
  };

  return {
    search,
    setSearch,
    category,
    setCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sort,
    setSort,
    hasFilters,
    reset,
    counts,
    filtered,
  };
}
