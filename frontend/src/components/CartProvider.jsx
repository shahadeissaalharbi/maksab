import { createContext, useEffect, useState } from "react";
import { CART_STORAGE_KEY, NO_STOCK_LIMIT } from "../constants/cart.js";

export const CartContext = createContext(null);

// هنا أقرا السلة المحفوظة، ولو فيها خلل أبدأ بسلة فاضية
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

// هنا الكمية ما تنزل عن أقل طلب ولا تزيد عن المتوفر
function clampQuantity(quantity, item) {
  return Math.max(Math.min(quantity, item.stock), item.moq);
}

// هنا السلة مشتركة بين البطاقات والشريط وصفحة السلة
function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // أحفظ السلة كل ما تتغير
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // لو المنتج موجود نزيد كميته واحد، وإلا نضيفه بأقل طلب
  const addToCart = (product) => {
    const moq = Number(product.moq) || 1;
    const stock =
      product.stock_quantity === undefined
        ? NO_STOCK_LIMIT
        : Number(product.stock_quantity);

    setItems((current) => {
      const exists = current.some((item) => item.product_id === product.id);

      if (exists) {
        return current.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: clampQuantity(item.quantity + 1, item) }
            : item
        );
      }

      const line = {
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        unit: product.unit || "",
        supplier_id: product.supplier_id || null,
        supplier_name: product.supplier_name || "",
        moq,
        stock,
      };
      return [...current, { ...line, quantity: clampQuantity(moq, line) }];
    });
  };

  const changeQuantity = (productId, quantity) =>
    setItems((current) =>
      current.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: clampQuantity(Number(quantity) || item.moq, item) }
          : item
      )
    );

  const removeItem = (productId) =>
    setItems((current) => current.filter((item) => item.product_id !== productId));

  const clearCart = () => setItems([]);

  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }

  const value = { items, total, addToCart, changeQuantity, removeItem, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;