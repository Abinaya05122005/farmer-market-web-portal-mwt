import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { currentUser, isBuyer, isAuthenticated, openLoginModal } = useAuth();
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState([]);

  // Sync wishlist with current buyer's individual localStorage slot
  useEffect(() => {
    if (isAuthenticated && isBuyer && currentUser?.id) {
      const storageKey = `farmstore_wishlist_${currentUser.id}`;
      const saved = localStorage.getItem(storageKey);
      setWishlist(saved ? JSON.parse(saved) : []);
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, isBuyer, currentUser?.id]);

  // Save changes to localStorage for this specific buyer
  useEffect(() => {
    if (isAuthenticated && isBuyer && currentUser?.id) {
      const storageKey = `farmstore_wishlist_${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated, isBuyer, currentUser?.id]);

  // Check if a product is in the buyer's wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Toggle wishlist state for a product
  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      openLoginModal('buyer');
      return { success: false, reason: 'unauthenticated' };
    }

    if (!isBuyer) {
      return { success: false, reason: 'unauthorized_role' };
    }

    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      return { success: true, action: 'removed' };
    } else {
      // Prevent duplicates
      setWishlist((prev) => [product, ...prev]);
      return { success: true, action: 'added' };
    }
  };

  // Explicit remove
  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  // Move a saved crop from Wishlist into the Cart
  const moveToCart = (product) => {
    if (!isBuyer) return;
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
