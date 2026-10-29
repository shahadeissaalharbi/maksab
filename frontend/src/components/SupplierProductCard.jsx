import { useState } from "react";
import { getStockStatus, SUPPLIER_TEXT, PRODUCT_MESSAGES } from "../constants/supplier.js";

// هنا بطاقة منتج المورد: تعديل السعر وحذف المنتج
function SupplierProductCard({ product, onUpdatePrice, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(product.price);
  const stock = getStockStatus(product.stock_status);

  // هنا أبدأ التعديل من السعر الحالي
  const startEditing = () => {
    setPrice(product.price);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdatePrice(product.id, price);
    setIsEditing(false);
  };

  // هنا أتأكد قبل الحذف، لأن الحذف نهائي
  const handleDelete = () => {
    if (window.confirm(PRODUCT_MESSAGES.DELETE_CONFIRM)) {
      onDelete(product.id);
    }
  };

  return (
    <article className="product-card">
      <div className="product-body">
        <span className={`stock-badge stock-${stock.tone}`}>{stock.label}</span>
        <h4>{product.name}</h4>

        {isEditing ? (
          <div className="edit-price-box">
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="price-input"
            />
            <span>{SUPPLIER_TEXT.CURRENCY}</span>
          </div>
        ) : (
          <p className="product-price">
            <strong>{Number(product.price)}</strong> {SUPPLIER_TEXT.CURRENCY}
          </p>
        )}

        <div className="product-actions">
          {isEditing ? (
            <>
              <button type="button" className="save-button" onClick={handleSave}>
                {SUPPLIER_TEXT.SAVE}
              </button>
              <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                {SUPPLIER_TEXT.CANCEL}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="edit-button" onClick={startEditing}>
                {SUPPLIER_TEXT.EDIT}
              </button>
              <button type="button" className="delete-button" onClick={handleDelete}>
                {PRODUCT_MESSAGES.DELETE}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default SupplierProductCard;