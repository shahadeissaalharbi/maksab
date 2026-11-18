import { createContext, useCallback, useEffect, useState } from "react";
import CartNotice from "./CartNotice.jsx";
import {
  CART_STORAGE_KEY,
  CART_TEXT,
  NO_STOCK_LIMIT,
} from "../constants/cart.js";

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
  const [notice, setNotice] = useState(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  // أحفظ السلة كل ما تتغير
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // هنا أطلع تنبيه الحد للمستخدم
  const showLimit = (text) => setNotice({ id: Date.now(), text });

  // لو المنتج موجود نزيد كميته واحد، وإلا نضيفه بأقل طلب
  // هنا ترجع true لو انضاف، و false لو وقفه الحد، عشان الزر يعرف وش يكتب
  const addToCart = (product) => {
    const moq = Number(product.moq) || 1;
    const stock =
      product.stock_quantity === undefined
        ? NO_STOCK_LIMIT
        : Number(product.stock_quantity);
    const existing = items.find((item) => item.product_id === product.id);

    // هنا لو المتوفر أقل من أقل طلب ما نقدر نضيفه
    if (!existing && stock < moq) {
      showLimit(CART_TEXT.LIMIT_STOCK(product.name, stock));
      return false;
    }

    // هنا لو الكمية وصلت المتوفر ننبه ونوقف
    if (existing && existing.quantity + 1 > existing.stock) {
      showLimit(CART_TEXT.LIMIT_STOCK(existing.name, existing.stock));
      return false;
    }

    setItems((current) => {
      if (existing) {
        return current.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: clampQuantity(item.quantity + 1, item) }
            : item,
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
    return true;
  };

  const changeQuantity = (productId, quantity) => {
    const target = items.find((item) => item.product_id === productId);
    if (!target) return;

    // هنا أنبه لو الكمية المطلوبة فوق المتوفر أو تحت أقل طلب
    const wanted = Number(quantity) || target.moq;
    if (wanted > target.stock) {
      showLimit(CART_TEXT.LIMIT_STOCK(target.name, target.stock));
    } else if (wanted < target.moq) {
      showLimit(CART_TEXT.LIMIT_MOQ(target.name, target.moq));
    }

    setItems((current) =>
      current.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: clampQuantity(wanted, item) }
          : item,
      ),
    );
  };

  const removeItem = (productId) =>
    setItems((current) =>
      current.filter((item) => item.product_id !== productId),
    );

  const clearCart = () => setItems([]);

  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }

  const value = {
    items,
    total,
    addToCart,
    changeQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartNotice notice={notice} onClose={closeNotice} />
    </CartContext.Provider>
  );
}

export default CartProvider;
