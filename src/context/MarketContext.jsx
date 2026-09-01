import React, { createContext, useState, useEffect } from 'react'

export const MarketContext = createContext(null)

// Simulated farmer market product catalog.
// In a real app this would come from an API endpoint.
const CATALOG = [
  { id: 1, name: 'Tomatoes', farmer: 'Green Valley Farm', price: 40, unit: 'kg', stock: 25 },
  { id: 2, name: 'Carrots', farmer: 'Sunrise Fields', price: 30, unit: 'kg', stock: 40 },
  { id: 3, name: 'Spinach', farmer: 'Green Valley Farm', price: 20, unit: 'bunch', stock: 15 },
  { id: 4, name: 'Potatoes', farmer: 'Hillside Growers', price: 25, unit: 'kg', stock: 60 },
  { id: 5, name: 'Onions', farmer: 'Hillside Growers', price: 22, unit: 'kg', stock: 50 },
  { id: 6, name: 'Mangoes', farmer: 'Sunrise Fields', price: 60, unit: 'kg', stock: 18 },
  { id: 7, name: 'Brinjal', farmer: 'Meadow Organic Farm', price: 28, unit: 'kg', stock: 22 },
  { id: 8, name: 'Cauliflower', farmer: 'Meadow Organic Farm', price: 35, unit: 'piece', stock: 12 }
]

export function MarketProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)

  // useEffect: simulate fetching the product list from a server on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(CATALOG)
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  function updateQty(productId, qty) {
    if (qty < 1) return
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty } : item))
    )
  }

  function clearCart() {
    setCart([])
  }

  function login(username) {
    setUser({ name: username })
  }

  function logout() {
    setUser(null)
  }

  const value = {
    products,
    loading,
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    user,
    login,
    logout
  }

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
}
