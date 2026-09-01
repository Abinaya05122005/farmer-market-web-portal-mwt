import React, { useState, useCallback } from "react";

// 2) REGISTER DETAILS -> useState
// All form fields live in one state object. Nothing is sent anywhere;
// this is local component state that stores what the user typed.
const EMPTY_FORM = { name: "", email: "", phone: "", password: "" };

export default function RegisterForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [showForm, setShowForm] = useState(true);

  // useCallback -> stable handler reference passed to every <input onChange>
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!form.name || !form.email || !form.phone || !form.password) {
        alert("Ella fields-um fill pannunga!");
        return;
      }
      setRegisteredUser(form);
      setShowForm(false);
    },
    [form]
  );

  const handleEdit = useCallback(() => setShowForm(true), []);

  if (!showForm && registeredUser) {
    return (
      <div className="card register-card">
        <h3>Welcome back, {registeredUser.name}! 👋</h3>
        <p className="muted">
          {registeredUser.email} · {registeredUser.phone}
        </p>
        <button className="btn-ghost" onClick={handleEdit}>
          Edit details
        </button>
      </div>
    );
  }

  return (
    <form className="card register-card" onSubmit={handleSubmit}>
      <h3>Register to shop</h3>
      <div className="form-grid">
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
      </div>
      <button className="btn-primary" type="submit">
        Register
      </button>
    </form>
  );
}
