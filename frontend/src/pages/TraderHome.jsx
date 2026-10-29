import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Banner from "../components/Banner.jsx";
import BestSellers from "../components/BestSellers.jsx";
import SearchBar from "../components/SearchBar.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { ROUTES } from "../constants/routes.js";
import { LOAD_STATUS, MARKET_TEXT } from "../constants/market.js";
import { getToken, getUser } from "../services/session.js";
import { useTraderProducts } from "../hooks/useTraderProducts.js";
import { useProductFilters } from "../hooks/useProductFilters.js";
import "../styles/Auth.css";
import "../styles/Trader.css";

// هنا صفحة التاجر الرئيسية: تركّب الشريط والبحث والتصنيفات والبطاقات
function TraderHome() {
  const { products, status } = useTraderProducts();
  const { search, setSearch, category, setCategory, counts, filtered } =
    useProductFilters(products);

  // هنا اللي ما سجل دخول يرجع لصفحة الدخول
  if (!getToken()) return <Navigate to={ROUTES.LOGIN} />;

  return (
    <div className="trader-page" dir="rtl">
      <Navbar userName={getUser()?.full_name} />
      <Banner />
      <BestSellers products={products} />

      <section className="market-hero">
        <span className="market-badge">{MARKET_TEXT.BADGE}</span>
        <h1>{MARKET_TEXT.TITLE}</h1>
      </section>

      <div className="market-body">
        <CategoryFilter
          selected={category}
          onSelect={setCategory}
          counts={counts}
        />

        <main className="market-results">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={MARKET_TEXT.SEARCH_PLACEHOLDER}
          />

          <p className="market-count">
            {MARKET_TEXT.productsCount(filtered.length)}
          </p>

          {status === LOAD_STATUS.LOADING && (
            <p className="market-state">{MARKET_TEXT.LOADING}</p>
          )}
          {status === LOAD_STATUS.ERROR && (
            <p className="market-state error">{MARKET_TEXT.ERROR}</p>
          )}
          {status === LOAD_STATUS.READY && filtered.length === 0 && (
            <p className="market-state">{MARKET_TEXT.EMPTY}</p>
          )}

          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TraderHome;
