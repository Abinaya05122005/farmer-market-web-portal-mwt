import React, { useContext, useState, useEffect } from 'react'
import { MarketContext } from '../context/MarketContext.jsx'

export default function Cart({ setPage }) {
  const { cart, removeFromCart, updateQty, clearCart, user } = useContext(MarketContext)
  const [total, setTotal] = useState(0)
  const [placed, setPlaced] = useState(false)

  // useEffect: recalculate the total whenever the cart changes
  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
    setTotal(sum)
  }, [cart])

  function handlePlaceOrder() {
    if (!user) {
      setPage('login')
      return
    }
    setPlaced(true)
    clearCart()
  }

  if (placed) {
    return (
      <div className="page">
        <h1>Order Placed</h1>
        <p>Thank you, {user.name}. Your order has been placed successfully.</p>
        <button className="btn" onClick={() => setPage('products')}>
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>Rs. {item.price}</td>
                  <td>
                    <button
                      className="btn-tiny"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                    >
                      -
                    </button>
                    <span className="qty">{item.qty}</span>
                    <button
                      className="btn-tiny"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </td>
                  <td>Rs. {item.price * item.qty}</td>
                  <td>
                    <button className="btn-small" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-total">Total: Rs. {total}</div>

          <button className="btn" onClick={handlePlaceOrder}>
            {user ? 'Place Order' : 'Login to Place Order'}
          </button>
        </>
      )}
    </div>
  )
}
