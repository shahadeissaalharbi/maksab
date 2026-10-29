import { useState } from "react";
import FormMessage from "./FormMessage.jsx";
import { HTTP_STATUS, MESSAGE_TYPES } from "../constants/messages.js";
import { PRODUCT_FORM_TEXT, SUPPLIER_TEXT, getProductError } from "../constants/supplier.js";
import "../styles/ProductModal.css";

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: "",
  stock_quantity: 1,
  unit: "",
  moq: 1,
};

// هنا نافذة إضافة منتج: تجمع البيانات، والصفحة هي اللي ترسلها للباك
function AddProductModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // هنا دالة وحدة لكل الحقول، تعرف الحقل من name
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  // هنا زر + و − للكمية، والكمية ما تنزل تحت صفر
  const changeStock = (amount) =>
    setForm({ ...form, stock_quantity: Math.max(0, Number(form.stock_quantity) + amount) });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    // هنا أحول الأرقام من نص لرقم، والحقول الاختيارية الفاضية ما أرسلها
    const product = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      unit: form.unit.trim() || undefined,
      moq: Number(form.moq),
    };

    try {
      const { status } = await onSubmit(product);
      if (status === HTTP_STATUS.CREATED) {
        onClose();
        return;
      }
      setMessage({ type: MESSAGE_TYPES.ERROR, text: getProductError(status) });
    } catch {
      setMessage({ type: MESSAGE_TYPES.ERROR, text: getProductError("NETWORK") });
    }
    setLoading(false);
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div
        className="pm-modal"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pm-header">
          <div>
            <p className="pm-eyebrow">{PRODUCT_FORM_TEXT.EYEBROW}</p>
            <h2>{PRODUCT_FORM_TEXT.TITLE}</h2>
          </div>
          <button
            type="button"
            className="pm-close"
            onClick={onClose}
            aria-label={PRODUCT_FORM_TEXT.CLOSE}
          >
            ×
          </button>
        </div>

        <form className="pm-form" onSubmit={handleSubmit}>
          <label htmlFor="product-name">{PRODUCT_FORM_TEXT.NAME}</label>
          <input
            id="product-name"
            name="name"
            value={form.name}
            onChange={updateField}
            placeholder={PRODUCT_FORM_TEXT.NAME_PLACEHOLDER}
            maxLength={150}
            required
          />

          <label htmlFor="product-description">{PRODUCT_FORM_TEXT.DESCRIPTION}</label>
          <textarea
            id="product-description"
            name="description"
            rows="3"
            value={form.description}
            onChange={updateField}
            placeholder={PRODUCT_FORM_TEXT.DESCRIPTION_PLACEHOLDER}
          />

          <div className="pm-row">
            <div className="pm-field">
              <label htmlFor="product-price">{PRODUCT_FORM_TEXT.PRICE}</label>
              <div className="pm-price">
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={updateField}
                  required
                />
                <span>{SUPPLIER_TEXT.CURRENCY}</span>
              </div>
            </div>

            <div className="pm-field">
              <label htmlFor="product-stock">{PRODUCT_FORM_TEXT.STOCK}</label>
              <div className="pm-stepper">
                <button type="button" onClick={() => changeStock(1)}>+</button>
                <input
                  id="product-stock"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={updateField}
                  required
                />
                <button type="button" onClick={() => changeStock(-1)}>−</button>
              </div>
            </div>
          </div>
          <p className="pm-hint">{PRODUCT_FORM_TEXT.STOCK_HINT}</p>

          <div className="pm-row">
            <div className="pm-field">
              <label htmlFor="product-unit">{PRODUCT_FORM_TEXT.UNIT}</label>
              <input
                id="product-unit"
                name="unit"
                value={form.unit}
                onChange={updateField}
                placeholder={PRODUCT_FORM_TEXT.UNIT_PLACEHOLDER}
                maxLength={50}
              />
            </div>

            <div className="pm-field">
              <label htmlFor="product-moq">{PRODUCT_FORM_TEXT.MOQ}</label>
              <input
                id="product-moq"
                name="moq"
                type="number"
                min="1"
                value={form.moq}
                onChange={updateField}
                required
              />
            </div>
          </div>

          <FormMessage message={message} />

          <div className="pm-actions">
            <button type="submit" className="pm-submit" disabled={loading}>
              {loading ? PRODUCT_FORM_TEXT.SUBMITTING : PRODUCT_FORM_TEXT.SUBMIT}
            </button>
            <button type="button" className="pm-cancel" onClick={onClose}>
              {PRODUCT_FORM_TEXT.CANCEL}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;