import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

// 1) THEME CONTEXT -> useContext
// Theme value + toggler is created once here and shared with every
// component in the tree (Header, ProductCard, Cart, RegisterForm...)
// without having to pass "theme" as a prop through each of them.
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // useCallback -> toggleTheme keeps the same function identity across
  // renders, so any button using it as a prop doesn't re-render needlessly.
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  // useEffect -> whenever the theme changes, reflect it on <html> so that
  // CSS variables in index.css (light/dark) switch automatically.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = { theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
