import ProductCard from "./ProductCard.jsx";

// هنا قسم الأكثر مبيعًا، يعرض أول 4 منتجات لين الباك يرجع الأكثر مبيعًا فعلًا
function BestSellers({ products }) {
  const topProducts = products.slice(0, 4);

  if (topProducts.length === 0) return null;

  return (
    <section className="best-sellers">
      <h2>الأكثر مبيعًا</h2>

      <div className="product-grid">
        {topProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default BestSellers;
