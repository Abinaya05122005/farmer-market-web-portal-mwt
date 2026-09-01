import React, { useContext } from 'react'
import { MarketContext } from '../context/MarketContext.jsx'

export default function Navbar({ page, setPage }) {
  const { cart, user, logout } = useContext(MarketContext)

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const links = [
    { key: 'home', label: 'Home' },
    { key: 'products', label: 'Products' },
    { key: 'cart', label: `Cart (${cartCount})` },
    { key: 'login', label: user ? user.name : 'Login' }
  ]

  return (
    <header className="navbar">
      <div className="brand" onClick={() => setPage('home')}>
        Farmer Market Portal
      </div>
      <nav>
        {links.map((link) => (
          <button
            key={link.key}
            className={page === link.key ? 'nav-link active' : 'nav-link'}
            onClick={() => setPage(link.key)}
          >
            {link.label}
          </button>
        ))}
        {user && (
          <button className="nav-link" onClick={logout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  )
}
