import { useState } from "react";
import { getStockStatus, SUPPLIER_TEXT } from "../constants/supplier.js";

// هنا بطاقة منتج المورد، مع إمكانية تعديل السعر
function SupplierProductCard({ product, onUpdatePrice }) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(product.price);
  const stock = getStockStatus(product.stock_status);

  const handleSave = () => {
    if (onUpdatePrice) {
      onUpdatePrice(product.id, price);
    }
    setIsEditing(false);
  };

  return (
    <article className="product-card">
      <div className="product-body">
        <span className={`stock-badge stock-${stock.tone}`}>{stock.label}</span>
        <h4>{product.name}</h4>

        {isEditing ? (
          <div className="edit-price-box" style={{ margin: "10px 0", display: "flex", gap: "5px", alignItems: "center" }}>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="price-input"
              style={{ width: "80px", padding: "4px" }}
            />
            <span>{SUPPLIER_TEXT.CURRENCY}</span>
          </div>
        ) : (
          <p className="product-price">
            <strong>{Number(price)}</strong> {SUPPLIER_TEXT.CURRENCY}
          </p>
        )}

        <div className="product-actions" style={{ marginTop: "10px" }}>
          {isEditing ? (
            <div style={{ display: "flex", gap: "5px" }}>
              <button type="button" className="save-button" onClick={handleSave}>
                حفظ
              </button>
              <button type="button" className="cancel-button" onClick={() => { setPrice(product.price); setIsEditing(false); }}>
                إلغاء
              </button>
            </div>
          ) : (
            <button type="button" className="edit-button" onClick={() => setIsEditing(true)}>
              {SUPPLIER_TEXT.EDIT}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default SupplierProductCard;