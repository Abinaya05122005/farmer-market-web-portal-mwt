import React, { forwardRef } from "react";

// 3) forwardRef -> lets <App> hold the DOM ref of this input and call
// .focus() on it from outside (used after "Add to cart" -> useRef).
const SearchBar = forwardRef(function SearchBar({ value, onChange }, ref) {
  return (
    <input
      ref={ref}
      className="search-input"
      value={value}
      onChange={onChange}
      placeholder="Search product name or farmer…"
    />
  );
});

export default SearchBar;
