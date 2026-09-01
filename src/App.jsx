import React, { useState } from 'react'
import { MarketProvider } from './context/MarketContext.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import About from './pages/About.jsx'

export default function App() {
  // useState: tracks which page is currently visible.
  // A simple state-based switch is used instead of a router
  // to keep the app limited to useState / useEffect / useContext.
  const [page, setPage] = useState('home')

  function renderPage() {
    switch (page) {
      case 'products':
        return <Products />
      case 'cart':
        return <Cart setPage={setPage} />
      case 'login':
        return <Login setPage={setPage} />
      case 'about':
        return <About />
      case 'home':
      default:
        return <Home setPage={setPage} />
    }
  }

  return (
    <MarketProvider>
      <div className="app">
        <Navbar page={page} setPage={setPage} />
        <main>{renderPage()}</main>
        <footer className="footer">
          <button className="link-btn" onClick={() => setPage('about')}>
            About
          </button>
          <span> | Farmer Market Portal</span>
        </footer>
      </div>
    </MarketProvider>
  )
}
