import React, { useContext, useState } from 'react'
import { MarketContext } from '../context/MarketContext.jsx'

export default function Login({ setPage }) {
  const { user, login, logout } = useContext(MarketContext)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (name.trim() === '') {
      setError('Please enter your name to continue.')
      return
    }
    setError('')
    login(name.trim())
    setPage('products')
  }

  if (user) {
    return (
      <div className="page">
        <h1>Account</h1>
        <p>You are logged in as {user.name}.</p>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Login</h1>
      <p>Enter your name to log in and place orders.</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ramesh Kumar"
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit">
          Login
        </button>
      </form>
    </div>
  )
}
