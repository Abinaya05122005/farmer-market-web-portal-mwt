import React, { createContext, useContext, useState, useEffect } from 'react';
import initialProducts from '../data/products.json';
import { calculateDistanceKm, getCoordinatesForCity } from '../utils/distance';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { currentUser, token: authToken, isAuthenticated } = useAuth();
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('farmstore_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If cached products have old fake price (e.g. Tomatoes < ₹10), invalidate stale cache
        const hasFakePrices = Array.isArray(parsed) && parsed.some(p => p.id === 'veg-1' && Number(p.price) < 10);
        if (!hasFakePrices && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        } else {
          localStorage.removeItem('farmstore_products');
        }
      }
    } catch (e) {}
    return initialProducts;
  });

  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [isOrganicOnly, setIsOrganicOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(1000);
  const [sortBy, setSortBy] = useState('nearest'); // Default: Nearest First
  const [radiusFilter, setRadiusFilter] = useState('all'); // 'all', 5, 10, 25, 50

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const sanitized = data.products.map((p) => ({
            ...p,
            price: Number(p.price || 0),
            stock: Number(p.stock || 0),
          }));
          setProducts(sanitized);
          localStorage.setItem('farmstore_products', JSON.stringify(sanitized));
        }
      }
    } catch (e) {
      console.warn('Backend product fetch notice (using cached):', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const fetchRecentlyViewed = async () => {
    try {
      const activeToken = authToken || localStorage.getItem('farmstore_token') || localStorage.getItem('token');
      if (!activeToken || !isAuthenticated || !currentUser || (currentUser.role !== 'buyer' && currentUser.role !== 'admin')) {
        setRecentlyViewed([]);
        return;
      }
      const res = await fetch('/api/products/recently-viewed?limit=8', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setRecentlyViewed(data.products);
        }
      }
    } catch (e) {
      console.warn('Backend fetch recently viewed error:', e.message);
    }
  };

  const recordProductView = async (productId) => {
    if (!productId) return;
    try {
      const activeToken = authToken || localStorage.getItem('farmstore_token') || localStorage.getItem('token');
      if (activeToken && isAuthenticated && (currentUser?.role === 'buyer' || currentUser?.role === 'admin')) {
        const res = await fetch(`/api/products/${productId}/view`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });
        if (res.ok) {
          fetchRecentlyViewed();
        }
      }
    } catch (e) {
      console.warn('Backend record product view error:', e.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Synchronize recently viewed on user session change
  useEffect(() => {
    if (isAuthenticated && currentUser && (currentUser.role === 'buyer' || currentUser.role === 'admin')) {
      fetchRecentlyViewed();
    } else {
      setRecentlyViewed([]);
    }
  }, [currentUser?.id, currentUser?.email, currentUser?.role, isAuthenticated]);

  // Farmer adds a new harvested crop listing
  const addProduct = async (newProduct) => {
    const isOrganicVal = Boolean(
      newProduct.is_organic !== undefined
        ? newProduct.is_organic
        : newProduct.isOrganic !== undefined
        ? newProduct.isOrganic
        : true
    );
    const productPayload = {
      ...newProduct,
      isOrganic: isOrganicVal,
      is_organic: isOrganicVal,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10) || 100,
    };

    let createdProduct = {
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      badge: 'New Harvest',
      ...productPayload,
    };

    try {
      const token = localStorage.getItem('farmstore_token');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productPayload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          createdProduct = {
            ...data.product,
            isOrganic: Boolean(data.product.is_organic ?? data.product.isOrganic),
            is_organic: Boolean(data.product.is_organic ?? data.product.isOrganic),
          };
        }
      }
    } catch (e) {}

    setProducts((prev) => [createdProduct, ...prev]);
    return createdProduct;
  };

  // Farmer / Admin edits a product
  const updateProduct = async (id, updatedFields) => {
    const fieldsToUpdate = { ...updatedFields };
    if (fieldsToUpdate.is_organic !== undefined && fieldsToUpdate.isOrganic === undefined) {
      fieldsToUpdate.isOrganic = Boolean(fieldsToUpdate.is_organic);
    } else if (fieldsToUpdate.isOrganic !== undefined && fieldsToUpdate.is_organic === undefined) {
      fieldsToUpdate.is_organic = Boolean(fieldsToUpdate.isOrganic);
    }

    try {
      const token = localStorage.getItem('farmstore_token');
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(fieldsToUpdate),
      });
    } catch (e) {}

    setProducts((prev) =>
      prev.map((p) => (p.id === id || p._id === id ? { ...p, ...fieldsToUpdate } : p))
    );
  };

  // Farmer / Admin deletes a product
  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('farmstore_token');
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {}

    setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
  };

  // Toggle stock availability
  const toggleStockStatus = (id) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      const newStock = target.stock > 0 ? 0 : 50;
      updateProduct(id, { stock: newStock });
    }
  };

  // Exact 6 categories as requested
  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Grains & Cereals',
    'Pulses & Legumes',
    'Dairy Products',
    'Herbs & Spices',
  ];

  // Helper to compute distance from stored buyer location
  const getDistanceForProduct = (item) => {
    let buyerLat = 11.0168;
    let buyerLng = 76.9558;
    try {
      const stored = localStorage.getItem('farmstore_buyer_location');
      if (stored) {
        const p = JSON.parse(stored);
        if (p.lat && p.lng) {
          buyerLat = p.lat;
          buyerLng = p.lng;
        }
      }
    } catch (e) {}

    let farmLat = item.latitude ?? item.lat;
    let farmLng = item.longitude ?? item.lng;

    if (farmLat === undefined || farmLng === undefined) {
      const coords = getCoordinatesForCity(item.farmLocation || item.city || 'Coimbatore');
      farmLat = coords.lat;
      farmLng = coords.lng;
    }

    return calculateDistanceKm(buyerLat, buyerLng, farmLat, farmLng);
  };

  // Filtered & Distance-Sorted Produce
  const filteredProducts = products
    .filter((product) => {
      // 1. Search query
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.farmerName && product.farmerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.farmLocation && product.farmLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      // 3. Sub-category
      const matchesSubCategory =
        selectedSubCategory === 'All' || product.subCategory === selectedSubCategory;

      // 4. Organic only
      const isOrg = Boolean(product.is_organic !== undefined ? product.is_organic : product.isOrganic);
      const matchesOrganic = !isOrganicOnly || isOrg;

      // 5. Price range
      const matchesPrice = product.price <= priceRange;

      // 6. Radius filter
      let matchesRadius = true;
      if (radiusFilter !== 'all') {
        const maxKm = Number(radiusFilter);
        const distance = getDistanceForProduct(product);
        matchesRadius = distance <= maxKm;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubCategory &&
        matchesOrganic &&
        matchesPrice &&
        matchesRadius
      );
    })
    .sort((a, b) => {
      if (sortBy === 'nearest') {
        const distA = getDistanceForProduct(a);
        const distB = getDistanceForProduct(b);
        return distA - distB;
      }
      if (sortBy === 'farthest') {
        const distA = getDistanceForProduct(a);
        const distB = getDistanceForProduct(b);
        return distB - distA;
      }
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.harvestDate) - new Date(a.harvestDate);
      return 0;
    });

  const value = {
    products,
    filteredProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    isOrganicOnly,
    setIsOrganicOnly,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    radiusFilter,
    setRadiusFilter,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStockStatus,
    categories,
    getDistanceForProduct,
    computeProductDistance: getDistanceForProduct,
    fetchProducts,
    recentlyViewed,
    recordProductView,
    fetchRecentlyViewed,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => useContext(ProductContext);
