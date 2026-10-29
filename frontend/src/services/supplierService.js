import { getJson, postJson, putJson, deleteJson } from "./http.js";
import { MOCK_SUPPLIER_HOME } from "./mockSupplierHome.js";

// هنا مفتاح خاص بلوحة المورد: false = الباك الحقيقي، true = بيانات تجريبية
const USE_SUPPLIER_MOCK = false;

const SUPPLIER_ENDPOINTS = {
  HOME: "/api/supplier/home",
  PRODUCTS: "/api/products",
};

// هنا أجيب بيانات المورد ومنتجاته
export async function getSupplierHome() {
  if (USE_SUPPLIER_MOCK) {
    return { status: 200, data: MOCK_SUPPLIER_HOME };
  }
  return getJson(SUPPLIER_ENDPOINTS.HOME);
}

// هنا أضيف منتج جديد
export async function addSupplierProduct(product) {
  if (USE_SUPPLIER_MOCK) {
    return { status: 201, data: { product: { id: Date.now(), ...product } } };
  }
  return postJson(SUPPLIER_ENDPOINTS.PRODUCTS, product);
}

// هنا أعدل منتج موجود (مثل السعر)
export async function updateSupplierProduct(productId, changes) {
  if (USE_SUPPLIER_MOCK) {
    return { status: 200, data: { product: { id: productId, ...changes } } };
  }
  return putJson(`${SUPPLIER_ENDPOINTS.PRODUCTS}/${productId}`, changes);
}

// هنا أحذف منتج
export async function deleteSupplierProduct(productId) {
  if (USE_SUPPLIER_MOCK) {
    return { status: 200, data: {} };
  }
  return deleteJson(`${SUPPLIER_ENDPOINTS.PRODUCTS}/${productId}`);
}