import { useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import SearchBar from "../components/SearchBar.jsx";
import StatCard from "../components/StatCard.jsx";
import SupplierProductCard from "../components/SupplierProductCard.jsx";
import AddProductModal from "../components/AddProductModal.jsx";
import FormMessage from "../components/FormMessage.jsx";
import { ROUTES } from "../constants/routes.js";
import { LOAD_STATUS, SUPPLIER_NAV_LINKS } from "../constants/market.js";
import { HTTP_STATUS, MESSAGE_TYPES } from "../constants/messages.js";
import {
  SUPPLIER_TEXT,
  PRODUCT_FORM_TEXT,
  PRODUCT_MESSAGES,
  getProductError,
} from "../constants/supplier.js";
import { getToken, getUser } from "../services/session.js";
import { useSupplierHome } from "../hooks/useSupplierHome.js";
import { useProductFilters } from "../hooks/useProductFilters.js";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/Supplier.css";

// هنا صفحة منتجات المورد: الأرقام والبحث، وإضافة وتعديل وحذف المنتجات
function SupplierHome() {
  const { supplier, products, stats, status, addProduct, updateProduct, removeProduct } =
    useSupplierHome();
  const { search, setSearch, filtered } = useProductFilters(products);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);

  // هنا اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  const displayName = supplier?.business_name ?? getUser()?.full_name;

  // هنا رسالة النجاح أو الخطأ اللي تطلع فوق المنتجات
  const showResult = (result, successStatus, successText) => {
    if (result.status === successStatus) {
      setMessage({ type: MESSAGE_TYPES.SUCCESS, text: successText });
    } else {
      setMessage({ type: MESSAGE_TYPES.ERROR, text: getProductError(result.status) });
    }
  };

  // هنا الإضافة: النافذة تعرض الخطأ بنفسها، والصفحة تعرض النجاح
  const handleAdd = async (product) => {
    const result = await addProduct(product);
    if (result.status === HTTP_STATUS.CREATED) {
      setMessage({ type: MESSAGE_TYPES.SUCCESS, text: PRODUCT_MESSAGES.ADDED });
    }
    return result;
  };

  const handleUpdatePrice = async (productId, newPrice) => {
    const result = await updateProduct(productId, { price: Number(newPrice) });
    showResult(result, HTTP_STATUS.OK, PRODUCT_MESSAGES.UPDATED);
  };

  const handleDelete = async (productId) => {
    const result = await removeProduct(productId);
    showResult(result, HTTP_STATUS.OK, PRODUCT_MESSAGES.DELETED);
  };

  return (
    <div className="trader-page" dir="rtl">
      <Navbar userName={getUser()?.full_name} links={SUPPLIER_NAV_LINKS} />

      <section className="market-hero">
        <span className="market-badge">{SUPPLIER_TEXT.BADGE}</span>
        <h1>{SUPPLIER_TEXT.greeting(displayName)}</h1>
        <p className="supplier-subtitle">{SUPPLIER_TEXT.SUBTITLE}</p>
      </section>

      <div className="supplier-body">
        <div className="stat-row">
          <StatCard label={SUPPLIER_TEXT.STAT_TOTAL} value={stats.total} />
          <StatCard label={SUPPLIER_TEXT.STAT_IN_STOCK} value={stats.inStock} />
          <StatCard label={SUPPLIER_TEXT.STAT_OUT_OF_STOCK} value={stats.outOfStock} />
        </div>

        <div className="supplier-toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder={SUPPLIER_TEXT.SEARCH_PLACEHOLDER} />
          <button type="button" className="add-product-button" onClick={() => setShowModal(true)}>
            {PRODUCT_FORM_TEXT.ADD_BUTTON}
          </button>
        </div>

        <FormMessage message={message} />

        {status === LOAD_STATUS.LOADING && <p className="market-state">{SUPPLIER_TEXT.LOADING}</p>}
        {status === LOAD_STATUS.ERROR && <p className="market-state error">{SUPPLIER_TEXT.ERROR}</p>}
        {status === LOAD_STATUS.READY && filtered.length === 0 && (
          <p className="market-state">{SUPPLIER_TEXT.EMPTY}</p>
        )}

        <div className="product-grid">
          {filtered.map((product) => (
            <SupplierProductCard
              key={product.id}
              product={product}
              onUpdatePrice={handleUpdatePrice}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {showModal && <AddProductModal onClose={() => setShowModal(false)} onSubmit={handleAdd} />}
    </div>
  );
}

export default SupplierHome;