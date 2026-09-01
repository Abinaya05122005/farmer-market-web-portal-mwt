import React, { useMemo } from "react";
import PRODUCTS from "../data/products.js";

export default function Cart({ cart }) {
  // 4) TOTAL CALCULATION -> useMemo
  // Recomputes only when `cart` actually changes (not on every keystroke
  // in the search bar, not on every theme toggle).
  const { lines, totalItems, totalAmount } = useMemo(() => {
    const productMap = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
    let totalItems = 0;
    let totalAmount = 0;
    const lines = Object.entries(cart).map(([id, qty]) => {
      const product = productMap[id];
      totalItems += qty;
      totalAmount += product.price * qty;
      return { product, qty };
    });
    return { lines, totalItems, totalAmount };
  }, [cart]);

  return (
    <div className="card cart-card">
      <h3>Your Cart ({totalItems})</h3>
      {lines.length === 0 ? (
        <p className="muted">Cart is empty. Add some fresh produce!</p>
      ) : (
        <>
          <div className="cart-lines">
            {lines.map(({ product, qty }) => (
              <div key={product.id} className="cart-line">
                <span>
                  {product.icon} {product.name} × {qty}
                </span>
                <span>₹{product.price * qty}</span>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </>
      )}
    </div>
  );
}
