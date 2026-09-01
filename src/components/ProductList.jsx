import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ProductList({ products, onAdd, cart }) {
  const { theme } = useTheme();

  if (products.length === 0) {
    return <p className="muted" style={{ padding: "20px 0" }}>No products match your search.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <div key={p.id} className={`card product-card ${theme}`}>
          <div className="product-icon">{p.icon}</div>
          <div className="product-name">{p.name}</div>
          <div className="muted product-farmer">{p.farmer}</div>
          <div className="product-footer">
            <span className="price">
              ₹{p.price} <span className="unit">/{p.unit}</span>
            </span>
            <button className="btn-primary small" onClick={() => onAdd(p)}>
              {cart[p.id] ? `Add (${cart[p.id]})` : "Add"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
