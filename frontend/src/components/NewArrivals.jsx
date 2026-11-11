import ProductCard from "./ProductCard.jsx";
import "../styles/NewArrivals.css";

const NEW_ARRIVALS_COUNT = 4;

// هنا قسم أحدث المنتجات: أول 4 منتجات، لأن الباك يرجع الأحدث أول
function NewArrivals({ products }) {
  const newest = products.slice(0, NEW_ARRIVALS_COUNT);

  if (newest.length === 0) return null;

  return (
    <section className="new-arrivals">
      <h2>أحدث المنتجات</h2>

      <div className="product-grid">
        {newest.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default NewArrivals;
