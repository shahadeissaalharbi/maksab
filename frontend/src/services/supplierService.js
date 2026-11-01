import { USE_MOCK } from "../config.js";
import { getJson, postJson, putJson, deleteJson } from "./http.js";
import { MOCK_SUPPLIER_HOME } from "./mockSupplierHome.js";
import { MOCK_PRODUCTS } from "./mockProducts.js";

// هنا مفتاح خاص بلوحة المورد: false = الباك الحقيقي، true = بيانات تجريبية
const USE_SUPPLIER_MOCK = USE_MOCK;

const SUPPLIER_ENDPOINTS = {
  HOME: "/api/supplier/home",
  PRODUCTS: "/api/products",
};

const MOCK_ADDED_PRODUCTS_KEY = "mock-market-products";

function saveMockMarketProduct(product) {
  const added = JSON.parse(localStorage.getItem(MOCK_ADDED_PRODUCTS_KEY) || "[]");
  added.push(product);
  localStorage.setItem(MOCK_ADDED_PRODUCTS_KEY, JSON.stringify(added));
}

function updateMockMarketProduct(productName, changes) {
  const added = JSON.parse(localStorage.getItem(MOCK_ADDED_PRODUCTS_KEY) || "[]");
  const product = added.find((item) => item.name === productName);
  if (!product) return;
  Object.assign(product, changes);
  localStorage.setItem(MOCK_ADDED_PRODUCTS_KEY, JSON.stringify(added));
}

function deleteMockMarketProduct(productName) {
  const added = JSON.parse(localStorage.getItem(MOCK_ADDED_PRODUCTS_KEY) || "[]");
  localStorage.setItem(
    MOCK_ADDED_PRODUCTS_KEY,
    JSON.stringify(added.filter((item) => item.name !== productName)),
  );
}

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
    const id =
      Math.max(
        0,
        ...MOCK_SUPPLIER_HOME.products.map((item) => item.id),
        ...MOCK_PRODUCTS.map((item) => item.id),
      ) + 1;
    const stock_quantity = Number(product.stock_quantity ?? 0);
    MOCK_SUPPLIER_HOME.products.push({
      id,
      name: product.name,
      price: String(product.price),
      stock_quantity,
      stock_status: stock_quantity > 0 ? "in_stock" : "out_of_stock",
    });
    MOCK_PRODUCTS.push({
      id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      unit: product.unit,
      moq: Number(product.moq ?? 1),
      supplier_name: MOCK_SUPPLIER_HOME.supplier.business_name,
      category: { type: "raw_material" },
    });
    saveMockMarketProduct(MOCK_PRODUCTS[MOCK_PRODUCTS.length - 1]);
    return { status: 201, data: { product: { id: Date.now(), ...product } } };
  }
  return postJson(SUPPLIER_ENDPOINTS.PRODUCTS, product);
}

// هنا أعدل منتج موجود (مثل السعر)
export async function updateSupplierProduct(productId, changes) {
  if (USE_SUPPLIER_MOCK) {
    const product = MOCK_SUPPLIER_HOME.products.find((item) => item.id === productId);
    if (!product) return { status: 404 };
    if (changes.price !== undefined) product.price = String(changes.price);
    if (changes.stock_quantity !== undefined) {
      product.stock_quantity = Number(changes.stock_quantity);
      product.stock_status = product.stock_quantity > 0 ? "in_stock" : "out_of_stock";
    }
    const marketProduct = MOCK_PRODUCTS.find((item) => item.name === product.name);
    if (marketProduct && changes.price !== undefined) {
      marketProduct.price = String(changes.price);
    }
    updateMockMarketProduct(product.name, changes.price === undefined ? {} : {
      price: String(changes.price),
    });
    return { status: 200, data: { product: { id: productId, ...changes } } };
  }
  return putJson(`${SUPPLIER_ENDPOINTS.PRODUCTS}/${productId}`, changes);
}

// هنا أحذف منتج
export async function deleteSupplierProduct(productId) {
  if (USE_SUPPLIER_MOCK) {
    const index = MOCK_SUPPLIER_HOME.products.findIndex((item) => item.id === productId);
    if (index === -1) return { status: 404 };
    MOCK_SUPPLIER_HOME.products.splice(index, 1);
    const removedProduct = MOCK_SUPPLIER_HOME.products[index];
    const marketIndex = MOCK_PRODUCTS.findIndex(
      (item) => item.name === removedProduct.name,
    );
    if (marketIndex !== -1) MOCK_PRODUCTS.splice(marketIndex, 1);
    deleteMockMarketProduct(removedProduct.name);
    return { status: 200, data: {} };
  }
  return deleteJson(`${SUPPLIER_ENDPOINTS.PRODUCTS}/${productId}`);
}