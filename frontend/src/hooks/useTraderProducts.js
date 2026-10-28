import { useEffect, useState } from "react";
import { HTTP_STATUS } from "../constants/messages.js";
import { LOAD_STATUS } from "../constants/market.js";
import { getTraderProducts } from "../services/traderService.js";

// هنا أجيب المنتجات أول ما تفتح الصفحة، وأتابع حالة التحميل
export function useTraderProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.LOADING);

  useEffect(() => {
    getTraderProducts()
      .then(({ status: code, data }) => {
        if (code === HTTP_STATUS.OK) {
          setProducts(data.products || []);
          setStatus(LOAD_STATUS.READY);
        } else {
          setStatus(LOAD_STATUS.ERROR);
        }
      })
      .catch(() => setStatus(LOAD_STATUS.ERROR));
  }, []);

  return { products, status };
}