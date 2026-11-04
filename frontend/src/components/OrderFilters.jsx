import { ORDER_FILTERS } from "../constants/myOrders.js";
import "../styles/OrderTracker.css";

// هنا تبويبات الطلبات: الكل وجارية ومكتملة وملغاة، وجنب كل واحد عدده
function OrderFilters({ selected, counts, onSelect }) {
  return (
    <div className="ot-tabs" role="tablist">
      {ORDER_FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={filter.id === selected}
          className={filter.id === selected ? "active" : ""}
          onClick={() => onSelect(filter.id)}
        >
          {filter.label} <small>{counts[filter.id] || 0}</small>
        </button>
      ))}
    </div>
  );
}

export default OrderFilters;
