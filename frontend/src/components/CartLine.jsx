import { CART_TEXT } from "../constants/cart.js";

// هنا سطر منتج واحد في السلة: الكمية والسعر والحذف
function CartLine({ item, onChangeQuantity, onRemove }) {
  const lineTotal = item.price * item.quantity;

  return (
    <div className="ct-line">
      <div className="ct-line-info">
        <strong>{item.name}</strong>
        <p>
          {item.unit && `${item.unit} · `}
          {item.price} {CART_TEXT.CURRENCY} · {CART_TEXT.MIN_ORDER} {item.moq}
        </p>
      </div>

      <div className="ct-stepper">
        <button
          type="button"
          onClick={() => onChangeQuantity(item.product_id, item.quantity + 1)}
          aria-label="+"
        >
          +
        </button>
        <input
          type="number"
          min={item.moq}
          value={item.quantity}
          onChange={(event) => onChangeQuantity(item.product_id, event.target.value)}
          aria-label={item.name}
        />
        <button
          type="button"
          onClick={() => onChangeQuantity(item.product_id, item.quantity - 1)}
          aria-label="−"
        >
          −
        </button>
      </div>

      <strong className="ct-line-total">
        {lineTotal.toLocaleString("en-US")} {CART_TEXT.CURRENCY}
      </strong>

      <button type="button" className="ct-remove" onClick={() => onRemove(item.product_id)}>
        {CART_TEXT.REMOVE}
      </button>
    </div>
  );
}

export default CartLine;