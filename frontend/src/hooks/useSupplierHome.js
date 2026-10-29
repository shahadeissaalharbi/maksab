import { useEffect, useMemo, useState } from "react";
import { HTTP_STATUS } from "../constants/messages.js";
import { LOAD_STATUS } from "../constants/market.js";
import { STOCK_STATUS } from "../constants/supplier.js";
import {
  getSupplierHome,
  addSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct,
} from "../services/supplierService.js";

// هنا أجيب بيانات المورد ومنتجاته، ومنه تنضاف وتتعدل وتنحذف المنتجات
export function useSupplierHome() {
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.LOADING);
  // هنا رقم يكبر بعد كل عملية ناجحة، وكل ما تغير أجيب المنتجات من جديد
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [reloadKey]);

  // هنا أشغل العملية، وإذا نجحت أطلب تحديث القائمة من الباك
  async function runAction(request, successStatus) {
    try {
      const result = await request();
      if (result.status === successStatus) {
        setReloadKey((key) => key + 1);
      }
      return result;
    } catch {
      return { status: "NETWORK" };
    }
  }

  const addProduct = (product) =>
    runAction(() => addSupplierProduct(product), HTTP_STATUS.CREATED);

  const updateProduct = (productId, changes) =>
    runAction(() => updateSupplierProduct(productId, changes), HTTP_STATUS.OK);

  const removeProduct = (productId) =>
    runAction(() => deleteSupplierProduct(productId), HTTP_STATUS.OK);

  // هنا أحسب كم منتج متوفر وكم نفد
  const stats = useMemo(() => {
    const inStock = products.filter((p) => p.stock_status === STOCK_STATUS.IN_STOCK.value).length;
    return { total: products.length, inStock, outOfStock: products.length - inStock };
  }, [products]);

  return { supplier, products, stats, status, addProduct, updateProduct, removeProduct };
}