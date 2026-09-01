import React, { useContext, useState, useEffect } from 'react'
import { MarketContext } from '../context/MarketContext.jsx'

export default function Products() {
  const { products, loading, addToCart } = useContext(MarketContext)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [addedId, setAddedId] = useState(null)

  // useEffect: recompute the filtered list whenever the search text
  // or the source product list changes
  useEffect(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      setFiltered(products)
    } else {
      setFiltered(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.farmer.toLowerCase().includes(term)
        )
      )
    }
  }, [search, products])

  // useEffect: temporary "Added" confirmation message that clears itself
  useEffect(() => {
    if (addedId === null) return
    const timer = setTimeout(() => setAddedId(null), 1000)
    return () => clearTimeout(timer)
  }, [addedId])

  function handleAdd(product) {
    addToCart(product)
    setAddedId(product.id)
  }

  return (
    <div className="page">
      <h1>Products</h1>

      <input
        className="search-box"
        type="text"
        placeholder="Search by product or farmer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading products...</p>
      ) : filtered.length === 0 ? (
        <p>No products match your search.</p>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Farmer</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.farmer}</td>
                <td>
                  Rs. {product.price} / {product.unit}
                </td>
                <td>{product.stock} available</td>
                <td>
                  <button className="btn-small" onClick={() => handleAdd(product)}>
                    {addedId === product.id ? 'Added' : 'Add to Cart'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
