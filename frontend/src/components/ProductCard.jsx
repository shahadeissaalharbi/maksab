import { getCategory } from "../constants/categories.js";
import { MARKET_TEXT } from "../constants/market.js";

// هنا بطاقة المنتج، ولون خلفيتها من تصنيفه
function ProductCard({ product }) {
  const category = getCategory(product.category?.type);

  return (
    <article className="product-card">
      <div className={`product-image tone-${category.tone || "green"}`}>
        {product.image_url && <img src={product.image_url} alt={product.name} />}
        <span className="product-badge">{category.label}</span>
      </div>

      <div className="product-body">
        <h4>{product.name}</h4>
        {product.unit && (
          <p className="product-meta">
            {product.unit} · {product.supplier_name}
          </p>
        )}

        {!product.unit && product.description && (
          <p className="product-meta">{product.description}</p>
        )}

        <p className="product-price">
          <strong>{Number(product.price)}</strong> {MARKET_TEXT.CURRENCY}
        </p>
        {product.moq && (
          <span className="product-moq">
            {MARKET_TEXT.MIN_ORDER} {product.moq}
          </span>
        )}

        <p className="product-details">{MARKET_TEXT.DETAILS}</p>
        <button type="button" className="add-to-cart">
          {MARKET_TEXT.ADD_TO_CART}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;