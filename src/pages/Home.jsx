import React, { useContext } from 'react'
import { MarketContext } from '../context/MarketContext.jsx'

export default function Home({ setPage }) {
  const { products } = useContext(MarketContext)

  const farmerCount = new Set(products.map((p) => p.farmer)).size

  return (
    <div className="page">
      <section className="hero">
        <h1>Fresh From The Farm To Your Table</h1>
        <p>
          Buy vegetables and fruits directly from local farmers. No
          middlemen, fair prices, and produce picked the same day.
        </p>
        <button className="btn" onClick={() => setPage('products')}>
          Browse Products
        </button>
      </section>

      <section className="stats">
        <div className="stat-box">
          <span className="stat-number">{products.length}</span>
          <span className="stat-label">Products Listed</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{farmerCount}</span>
          <span className="stat-label">Registered Farmers</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">100%</span>
          <span className="stat-label">Direct From Farm</span>
        </div>
      </section>

      <section className="info">
        <h2>How It Works</h2>
        <ol>
          <li>Browse the product list added by local farmers.</li>
          <li>Add the items you need to your cart.</li>
          <li>Log in with your name and place your order.</li>
        </ol>
      </section>
    </div>
  )
}
