import { CATEGORIES_ARRAY } from "../constants/categories.js";
import { MARKET_TEXT } from "../constants/market.js";

// هنا قائمة التصنيفات، وكل زر جنبه عدد منتجاته
function CategoryFilter({ selected, onSelect, counts }) {
  return (
    <aside className="category-filter">
      <h3>{MARKET_TEXT.CATEGORY_TITLE}</h3>

      {CATEGORIES_ARRAY.map((category) => (
        <button
          key={category.value}
          type="button"
          className={category.value === selected ? "active" : ""}
          onClick={() => onSelect(category.value)}
        >
          <span>{category.label}</span>
          <small>{counts[category.value] ?? 0}</small>
        </button>
      ))}
    </aside>
  );
}

export default CategoryFilter;