import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Header() {
  // useContext -> read theme + toggle function shared from ThemeProvider
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div>
        <div className="eyebrow">SIVAKASI · SUNRISE MARKET</div>
        <h1>Farmers' Market Portal</h1>
      </div>
      <button className="btn-ghost theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
      </button>
    </header>
  );
}
