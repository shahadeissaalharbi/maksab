import { FILTER_TEXT, SORT_OPTIONS } from "../constants/market.js";
import "../styles/MarketFilters.css";

// هنا فلتر السعر والترتيب، وزر يمسح كل الفلاتر
function MarketFilters({ minPrice, maxPrice, sort, hasFilters, onMin, onMax, onSort, onReset }) {
  return (
    <div className="mf-bar">
      <div className="mf-group">
        <span className="mf-label">{FILTER_TEXT.PRICE_LABEL}</span>
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={minPrice}
          onChange={(event) => onMin(event.target.value)}
          placeholder={FILTER_TEXT.PRICE_FROM}
          aria-label={FILTER_TEXT.PRICE_FROM}
        />
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={maxPrice}
          onChange={(event) => onMax(event.target.value)}
          placeholder={FILTER_TEXT.PRICE_TO}
          aria-label={FILTER_TEXT.PRICE_TO}
        />
      </div>

      <div className="mf-group">
        <label className="mf-label" htmlFor="mf-sort">
          {FILTER_TEXT.SORT_LABEL}
        </label>
        <select id="mf-sort" value={sort} onChange={(event) => onSort(event.target.value)}>
          {Object.values(SORT_OPTIONS).map((option) => (
            <option key={option} value={option}>
              {FILTER_TEXT.SORT[option]}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button type="button" className="mf-reset" onClick={onReset}>
          {FILTER_TEXT.RESET}
        </button>
      )}
    </div>
  );
}

export default MarketFilters;