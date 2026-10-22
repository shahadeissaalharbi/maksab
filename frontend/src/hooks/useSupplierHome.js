import { useEffect, useMemo, useState } from "react";
import { HTTP_STATUS } from "../constants/messages.js";
import { LOAD_STATUS } from "../constants/market.js";
import { STOCK_STATUS } from "../constants/supplier.js";
import { getSupplierHome } from "../services/supplierService.js";

// هنا أجيب بيانات المورد ومنتجاته، وأحسب أرقام المخزون
export function useSupplierHome() {
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.LOADING);

  useEffect(() => {
    getSupplierHome()
      .then(({ status: code, data }) => {
        if (code === HTTP_STATUS.OK) {
          setSupplier(data.supplier);
          setProducts(data.products ?? []);
          setStatus(LOAD_STATUS.READY);
        } else {
          setStatus(LOAD_STATUS.ERROR);
        }
      })
      .catch(() => setStatus(LOAD_STATUS.ERROR));
  }, []);

  // هنا أحسب كم منتج متوفر وكم نفد
  const stats = useMemo(() => {
    const inStock = products.filter((p) => p.stock_status === STOCK_STATUS.IN_STOCK.value).length;
    return { total: products.length, inStock, outOfStock: products.length - inStock };
  }, [products]);

  return { supplier, products, stats, status };
}