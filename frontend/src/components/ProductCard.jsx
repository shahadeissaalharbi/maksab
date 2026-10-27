import { getCategory } from "../constants/categories.js";
import { MARKET_TEXT } from "../constants/market.js";

// هنا بطاقة المنتج، ولون خلفيتها من تصنيفه
function ProductCard({ product }) {
  // إضافة قيمة افتراضية لتجنب خطأ لو كان التصنيف غير معرف
  const category = getCategory(product?.category?.type) || { tone: "green", label: "" };

  return (
    <article className="product-card">
      <div className={`product-image tone-${category.tone ?? "green"}`}>
        <span className="product-badge">{category.label}</span>
      </div>

      <div className="product-body">
        <h4>{product?.name}</h4>
        <p className="product-meta">
          {product?.unit} · {product?.supplier_name}
        </p>

        <p className="product-price">
          <strong>{Number(product?.price || 0)}</strong> {MARKET_TEXT.CURRENCY}
        </p>
        <span className="product-moq">
          {MARKET_TEXT.MIN_ORDER} {product?.moq}
        </span>

        <p className="product-details">{MARKET_TEXT.DETAILS}</p>
        <button type="button" className="add-to-cart">
          {MARKET_TEXT.ADD_TO_CART}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;