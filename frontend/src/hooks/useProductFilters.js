import { useMemo, useState } from "react";
import { CATEGORIES } from "../constants/categories.js";

// هنا منطق البحث والتصنيف، مفصول عن الشكل
export function useProductFilters(products) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(CATEGORIES.ALL.value);

  // هنا أحسب كم منتج في كل تصنيف عشان الأرقام جنب الأزرار
  const counts = useMemo(
    () =>
      products.reduce(
        (result, product) => {
          const type = product.category?.type;
          if (type) result[type] = (result[type] ?? 0) + 1;
          return result;
        },
        { [CATEGORIES.ALL.value]: products.length }
      ),
    [products]
  );

  // هنا المنتجات اللي تطابق البحث والتصنيف المختار
  const filtered = useMemo(() => {
    const query = search.trim();
    return products.filter(
      (product) =>
        (category === CATEGORIES.ALL.value || product.category?.type === category) &&
        (!query || product.name.includes(query))
    );
  }, [products, search, category]);

  return { search, setSearch, category, setCategory, counts, filtered };
}