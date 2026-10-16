import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>جاري تحميل المنتجات...</p>
  if (error) return <p style={{ textAlign: 'center', marginTop: '40px', color: 'red' }}>صار خطأ: {error}</p>
  if (products.length === 0) return <p style={{ textAlign: 'center', marginTop: '40px' }}>ما فيه منتجات حالياً.</p>

  return (
    <div dir="rtl" style={{ fontFamily: 'Tahoma, sans-serif', padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>قائمة المنتجات (مكسب)</h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {products.map((p) => (
          <li key={p.id} style={{ background: '#f9f9f9', margin: '10px 0', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>{p.name}</h3>
            <p style={{ margin: '0 0 5px 0', color: '#666' }}>{p.description}</p>
            <strong>السعر: {p.price} ريال</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
