import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import SearchBar from "../components/SearchBar.jsx";
import StatCard from "../components/StatCard.jsx";
import SupplierProductCard from "../components/SupplierProductCard.jsx";
import { ROUTES } from "../constants/routes.js";
import { LOAD_STATUS, SUPPLIER_NAV_LINKS } from "../constants/market.js";
import { SUPPLIER_TEXT } from "../constants/supplier.js";
import { getToken, getUser } from "../services/session.js";
import { useSupplierHome } from "../hooks/useSupplierHome.js";
import { useProductFilters } from "../hooks/useProductFilters.js";
import "../styles/Supplier.css";
import "../styles/Auth.css";
import "../styles/Trader.css";
import "../styles/Supplier.css";

// هنا لوحة المورد: الترحيب والأرقام والبحث والمنتجات مع إمكانية التعديل
function SupplierHome() {
  const { supplier, products, stats, status } = useSupplierHome();
  const [localProducts, setLocalProducts] = useState([]);

  // تحديث المنتجات المحلية أول ما تجري عملية الجلب من الهوك
  useEffect(() => {
    if (products) {
      setLocalProducts(products);
    }
  }, [products]);

  const { search, setSearch, filtered } = useProductFilters(localProducts);

  // هنا اللي ما سجل دخول يرجع لصفحة الدخول
  //if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  const displayName = supplier?.business_name ?? getUser()?.full_name;

  // دالة لتحديث سعر المنتج بناءً على الـ ID والسعر الجديد
  const handleUpdatePrice = (productId, newPrice) => {
    setLocalProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, price: newPrice } : p
      )
    );
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

        <SearchBar value={search} onChange={setSearch} placeholder={SUPPLIER_TEXT.SEARCH_PLACEHOLDER} />

        {status === LOAD_STATUS.LOADING && <p className="market-state">{SUPPLIER_TEXT.LOADING}</p>}
        {status === LOAD_STATUS.ERROR && <p className="market-state error">{SUPPLIER_TEXT.ERROR}</p>}
        {status === LOAD_STATUS.READY && filtered.length === 0 && <p className="market-state">{SUPPLIER_TEXT.EMPTY}</p>}

        <div className="product-grid">
          {filtered.map((product) => (
            <SupplierProductCard 
              key={product.id} 
              product={product} 
              onUpdatePrice={handleUpdatePrice} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SupplierHome;