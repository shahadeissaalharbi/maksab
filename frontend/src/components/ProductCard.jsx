import { useState } from "react";
import { getCategory } from "../constants/categories.js";
import { MARKET_TEXT } from "../constants/market.js";
import { CART_TEXT } from "../constants/cart.js";
import { useCart } from "../hooks/useCart.js";
import "../styles/ProductCompact.css";

const ADDED_MESSAGE_MS = 1500;

// هنا بطاقة المنتج، ولون خلفيتها من تصنيفه
function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const category = getCategory(product.category?.type);
  const soldOut =
    product.stock_quantity !== undefined && product.stock_quantity <= 0;

  // هنا أضيف المنتج للسلة، وأطلع «تمت الإضافة» ثانية ونص
  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), ADDED_MESSAGE_MS);
  };

  // هنا نص الزر: عادي، أو نفد، أو تمت الإضافة
  let buttonText = MARKET_TEXT.ADD_TO_CART;
  if (soldOut) buttonText = CART_TEXT.OUT_OF_STOCK;
  else if (added) buttonText = CART_TEXT.ADDED;

  return (
    <article className="product-card">
      <div className={`product-image tone-${category.tone || "green"}`}>
        {product.image_url && (
          <img src={product.image_url} alt={product.name} />
        )}
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
        <button
          type="button"
          className={`add-to-cart ${added ? "added" : ""}`}
          onClick={handleAdd}
          disabled={soldOut}
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
