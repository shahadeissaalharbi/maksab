import { useContext } from "react";
import { CartContext } from "../components/CartProvider.jsx";

// هنا أوصل لأي مكان في السلة: العناصر والإضافة والحذف
export function useCart() {
  return useContext(CartContext);
}