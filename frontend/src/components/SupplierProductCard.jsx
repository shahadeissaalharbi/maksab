import { useState } from "react";
import {
  getStockStatus,
  SUPPLIER_TEXT,
  PRODUCT_MESSAGES,
} from "../constants/supplier.js";
import { NAME_ERROR } from "../constants/messages.js";
import { isValidName } from "../utils/nameValidation.js";
import { IMAGE_TEXT } from "../constants/images.js";
import ProductImagePicker from "./ProductImagePicker.jsx";
import "../styles/ProductEdit.css";

// هنا بطاقة منتج المورد: صورته، وتعديل الاسم والسعر والكمية والصورة، وحذف المنتج
function SupplierProductCard({ product, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stockQuantity, setStockQuantity] = useState(
    product.stock_quantity ?? 0,
  );
  const [imageUrl, setImageUrl] = useState(product.image_url ?? null);
  const [imageBusy, setImageBusy] = useState(false);
  const stock = getStockStatus(product.stock_status);

  // هنا أبدأ التعديل من القيم الحالية
  const startEditing = () => {
    setName(product.name);
    setPrice(product.price);
    setStockQuantity(product.stock_quantity ?? 0);
    setImageUrl(product.image_url ?? null);
    setIsEditing(true);
  };

  // هنا الاسم يتأكد منه وقت الكتابة، وزر الحفظ ما ينضغط لين يصير صحيح
  const nameIsValid = isValidName(name);
  const nameError = !nameIsValid ? NAME_ERROR : "";

  const handleSave = () => {
    if (!nameIsValid) return;

    // الصورة تنرسل بس لو تغيرت، وnull يعني انشالت
    const imageChanged = imageUrl !== (product.image_url ?? null);
    onUpdate(product.id, {
      name: name.trim(),
      price: Number(price),
      stock_quantity: Number(stockQuantity),
      ...(imageChanged ? { image_url: imageUrl } : {}),
    });
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
      {product.image_url && !isEditing && (
        <img
          className="sp-image"
          src={product.image_url}
          alt={IMAGE_TEXT.ALT(product.name)}
        />
      )}

      <div className="product-body">
        <span className={`stock-badge stock-${stock.tone}`}>{stock.label}</span>

        {isEditing ? (
          <>
            <div className="edit-name-box">
              <label htmlFor={`product-name-${product.id}`}>
                {SUPPLIER_TEXT.EDIT_NAME}
              </label>
              <input
                id={`product-name-${product.id}`}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="edit-name-input"
              />
              {nameError && <span className="edit-error">{nameError}</span>}
            </div>

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
              <label>
                {SUPPLIER_TEXT.EDIT_STOCK}
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(event.target.value)}
                  className="stock-input"
                />
              </label>
            </div>

            <ProductImagePicker
              value={imageUrl}
              onChange={setImageUrl}
              onBusyChange={setImageBusy}
              compact
            />
          </>
        ) : (
          <>
            <h4>{product.name}</h4>
            <p className="product-price">
              <strong>{Number(product.price)}</strong> {SUPPLIER_TEXT.CURRENCY}
            </p>
          </>
        )}

        <div className="product-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="save-button"
                onClick={handleSave}
                disabled={!nameIsValid || imageBusy}
              >
                {SUPPLIER_TEXT.SAVE}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                {SUPPLIER_TEXT.CANCEL}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="edit-button"
                onClick={startEditing}
              >
                {SUPPLIER_TEXT.EDIT}
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
              >
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
