import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { calculateDistanceKm, findNearestFarmer, resolveLocationCoordinates, isFarmerOrderLocationMatch, isDeliveryPartnerLocationMatch } from '../utils/distance';

const CartContext = createContext();

// Regional Delivery Partner Fleet Pool
export const DELIVERY_PARTNERS_POOL = [
  {
    id: 'delivery-1',
    name: 'Ramesh Kumar (SpeedyFarm Express)',
    phone: '+91 98765 43210',
    vehicleType: 'Electric Cargo Van (TN-38-AF-2024)',
    serviceArea: 'Coimbatore & Pollachi Hub',
    region: 'Coimbatore',
  },
  {
    id: 'delivery-2',
    name: 'Karthik Raja (EcoRider Logistics)',
    phone: '+91 98412 34567',
    vehicleType: 'Refrigerated Two-Wheeler (TN-01-BK-8890)',
    serviceArea: 'Ooty & Nilgiris Route',
    region: 'Ooty',
  },
  {
    id: 'delivery-3',
    name: 'Senthil Nathan (Vaigai Logistics)',
    phone: '+91 98422 99881',
    vehicleType: 'Cold Cargo Van (TN-58-MM-4421)',
    serviceArea: 'Madurai & South Route',
    region: 'Madurai',
  },
];

// 7-Stage Order Workflow Timeline Generator
export const buildTrackingSteps = (status, timestamps = {}) => {
  const stages = [
    { key: 'placed', label: 'Order Placed', desc: 'Buyer placed the order' },
    { key: 'accepted', label: 'Farmer Accepted', desc: 'Farmer confirmed the harvest order' },
    { key: 'processing', label: 'Product Being Prepared', desc: 'Harvested, cleaned and packed at farm' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Handed over by Farmer for pickup' },
    { key: 'picked_up', label: 'Picked Up', desc: 'Collected by Delivery Partner from farm' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'On the way to Buyer doorstep' },
    { key: 'delivered', label: 'Delivered ✅', desc: 'Successfully received by Buyer' },
  ];

  const statusPriority = {
    Pending: 0,
    Placed: 0,
    Accepted: 1,
    Processing: 2,
    'Ready for Pickup': 3,
    'Picked Up': 4,
    'Out for Delivery': 5,
    Delivered: 6,
    Rejected: -1,
  };

  const currentIdx = statusPriority[status] ?? 0;

  return stages.map((stg, idx) => {
    const isDone = currentIdx >= idx && status !== 'Rejected';
    const isCurrent = currentIdx === idx && status !== 'Rejected';
    const time = timestamps[stg.key] || (isDone ? 'Completed' : 'Pending');
    return {
      key: stg.key,
      title: stg.label,
      desc: stg.desc,
      done: isDone,
      current: isCurrent,
      time: time,
    };
  });
};

export const INITIAL_DEFAULT_ORDERS = [
  {
    id: 'ord-1001',
    _id: 'ord-1001',
    date: '2026-10-07',
    buyerId: 'buyer-demo',
    buyerName: 'Ananya Sharma',
    buyerPhone: '+91 97100 11223',
    deliveryAddress: '88 Race Course Road, Coimbatore',
    deliveryCity: 'Coimbatore',
    deliveryDistrict: 'Coimbatore',
    farmerId: 'farmer-1',
    farmerName: 'Selvam Organic Farms',
    items: [
      {
        id: 'veg-1',
        productId: 'veg-1',
        name: 'Country Tomatoes (Nattu Thakkali)',
        price: 28.5,
        quantity: 3,
        unit: 'kg',
        farmerId: 'farmer-1',
        farmerName: 'Selvam Organic Farms',
        farmLocation: 'Coimbatore, Tamil Nadu',
      },
      {
        id: 'veg-2',
        productId: 'veg-2',
        name: 'Small Sambhar Onions (Chinna Vengayam)',
        price: 45.0,
        quantity: 2,
        unit: 'kg',
        farmerId: 'farmer-1',
        farmerName: 'Selvam Organic Farms',
        farmLocation: 'Coimbatore, Tamil Nadu',
      }
    ],
    totalAmount: 175.5,
    status: 'Processing',
    paymentMethod: 'UPI / Google Pay',
    paymentStatus: 'Paid',
    estimatedDelivery: 'Tomorrow Morning (8:00 AM)',
    timestamps: { placed: 'Today, 09:30 AM', confirmed: 'Today, 09:45 AM' },
    trackingSteps: [
      { key: 'placed', title: 'Order Placed', desc: 'Received by FarmStore', done: true, current: false, time: 'Today, 09:30 AM' },
      { key: 'confirmed', title: 'Harvest Confirmed', desc: 'Farmer packing produce', done: true, current: true, time: 'Today, 09:45 AM' },
      { key: 'pickup', title: 'Dispatched to Delivery', desc: 'En route to local hub', done: false, current: false, time: 'Pending' },
      { key: 'delivered', title: 'Delivered Fresh', desc: 'Completed', done: false, current: false, time: 'Pending' }
    ],
    createdAt: '2026-10-07T09:30:00.000Z'
  },
  {
    id: 'ord-1002',
    _id: 'ord-1002',
    date: '2026-10-07',
    buyerId: 'buyer-demo',
    buyerName: 'Priya Sundaram',
    buyerPhone: '+91 97100 67890',
    deliveryAddress: '12 Alagesan Road, Kovilpatti',
    deliveryCity: 'Kovilpatti',
    deliveryDistrict: 'Thoothukudi',
    farmerId: 'user-abi',
    farmerName: 'Abinaya',
    items: [
      {
        id: 'grain-1',
        productId: 'grain-1',
        name: 'Traditional Karuppu Kavuni Rice',
        price: 135.0,
        quantity: 2,
        unit: 'kg',
        farmerId: 'user-abi',
        farmerName: 'Abinaya',
        farmLocation: 'Kovilpatti, Tamil Nadu',
      },
      {
        id: 'spice-5',
        productId: 'spice-5',
        name: 'Hill Country Garlic (Malai Poondu)',
        price: 180.0,
        quantity: 1,
        unit: 'kg',
        farmerId: 'user-abi',
        farmerName: 'Abinaya',
        farmLocation: 'Kovilpatti, Tamil Nadu',
      }
    ],
    totalAmount: 450.0,
    status: 'Pending',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    estimatedDelivery: 'Tomorrow Evening',
    timestamps: { placed: 'Today, 11:15 AM' },
    trackingSteps: [
      { key: 'placed', title: 'Order Placed', desc: 'Received from Buyer', done: true, current: true, time: 'Today, 11:15 AM' },
      { key: 'confirmed', title: 'Farmer Accepted', desc: 'Harvesting & packing', done: false, current: false, time: 'Pending' },
      { key: 'delivered', title: 'Delivered', desc: 'Completed', done: false, current: false, time: 'Pending' }
    ],
    createdAt: '2026-10-07T11:15:00.000Z'
  }
];

export const CartProvider = ({ children }) => {
  const { currentUser, allUsers = [], isFarmer } = useAuth();

  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('farmstore_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [allOrders, setAllOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('farmstore_all_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_DEFAULT_ORDERS;
  });

  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('farmstore_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync allOrders to localStorage
  useEffect(() => {
    localStorage.setItem('farmstore_all_orders', JSON.stringify(allOrders));
  }, [allOrders]);

  // Isolate and filter orders strictly per authenticated user ID
  const fetchOrders = async () => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    const userId = String(currentUser.id || currentUser._id || '');
    const userRole = currentUser.role;

    if (!userId) {
      setOrders([]);
      return;
    }

    // Attempt live fetch from backend API
    try {
      const token = localStorage.getItem('farmstore_token');
      let endpoint = '';
      if (userRole === 'buyer') endpoint = '/api/orders/my-orders';
      else if (userRole === 'farmer') endpoint = '/api/orders/farmer-orders';
      else if (userRole === 'delivery') endpoint = '/api/orders/delivery-orders';
      else if (userRole === 'admin') endpoint = '/api/orders/all';

      if (endpoint) {
        const res = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
            // Merge into allOrders cache
            setAllOrders((prev) => {
              const map = new Map();
              [...data.orders, ...prev].forEach((item) => {
                if (item?.id) map.set(item.id, item);
              });
              return Array.from(map.values());
            });
            return;
          }
        }
      }
    } catch (apiErr) {
      console.warn('Backend order fetch fallback to local:', apiErr.message);
    }

    if (userRole === 'buyer') {
      // Buyer sees ONLY their own orders strictly filtered by buyer's user ID
      const buyerOrders = allOrders.filter((o) => {
        const oBuyerId = String(o.buyerId || '');
        const oBuyer = typeof o.buyer === 'object' && o.buyer !== null
          ? String(o.buyer._id || o.buyer.id || '')
          : String(o.buyer || '');
        return oBuyerId === userId || oBuyer === userId;
      });
      setOrders(buyerOrders);
    } else if (userRole === 'farmer') {
      // Farmer sees orders assigned to their farm or matched to their regional location/hub
      const farmerOrders = allOrders
        .filter((o) => isFarmerOrderLocationMatch(currentUser, o))
        .map((o) => {
          const myItems = o.items?.filter((item) => {
            const iFarmerId = String(item.farmerId || item.farmer || '');
            const iFarmerName = String(item.farmerName || '').toLowerCase().trim();
            const myName = String(currentUser.name || '').toLowerCase().trim();
            const myFarm = String(currentUser.farmName || '').toLowerCase().trim();
            return iFarmerId === userId || (iFarmerName && (iFarmerName === myName || (myFarm && iFarmerName === myFarm)));
          });
          return {
            ...o,
            items: myItems && myItems.length > 0 ? myItems : o.items,
          };
        });
      setOrders(farmerOrders);
    } else if (userRole === 'delivery') {
      const deliveryOrders = allOrders.filter((o) => isDeliveryPartnerLocationMatch(currentUser, o));
      setOrders(deliveryOrders);
    } else if (userRole === 'admin') {
      setOrders(allOrders);
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser?.id, currentUser?._id, currentUser?.role, allOrders]);

  // Add Item to Cart (Restricted for Farmers as per role rules)
  const addToCart = (product, quantity = 1) => {
    if (isFarmer) {
      alert('Farmers cannot purchase crops from the customer cart. Please use a Buyer account to shop.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('farmstore_cart');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  const freeDeliveryThreshold = 500;

  // Calculate Haversine distance between buyer location and nearest farm
  const getPrimaryFarmDistance = (customBuyerLocation = null) => {
    let buyerCoords = { lat: 11.0168, lng: 76.9558 };
    if (customBuyerLocation) {
      buyerCoords = resolveLocationCoordinates(customBuyerLocation);
    } else {
      try {
        const stored = localStorage.getItem('farmstore_buyer_location');
        if (stored) {
          const p = JSON.parse(stored);
          buyerCoords = resolveLocationCoordinates(p);
        }
      } catch (e) {}
    }

    // Check nearest farmer across registered farmers
    const nearest = findNearestFarmer(buyerCoords, allUsers);
    if (nearest && nearest.distanceKm) {
      return nearest.distanceKm;
    }

    if (cart.length > 0) {
      const first = cart[0].product;
      const farmCoords = resolveLocationCoordinates({
        lat: first.latitude ?? first.lat,
        lng: first.longitude ?? first.lng,
        address: first.farmLocation,
      });
      const d = calculateDistanceKm(farmCoords.lat, farmCoords.lng, buyerCoords.lat, buyerCoords.lng);
      if (d !== null) return d;
    }

    return 4.5;
  };

  const primaryFarmDistance = getPrimaryFarmDistance();

  // Tiered Delivery Fee
  const deliveryFee =
    cartSubtotal >= freeDeliveryThreshold || cartSubtotal === 0
      ? 0
      : primaryFarmDistance <= 15
      ? 40
      : primaryFarmDistance <= 35
      ? 70 // ₹40 + ₹30 distance fee
      : 90; // Regional transit fee

  const cartTotal = cartSubtotal + deliveryFee;

  // STEP 1: Buyer places location-based order
  const placeOrder = async ({ buyer, deliveryAddress, deliveryCity, paymentMethod }) => {
    const activeBuyerId = String(currentUser?.id || currentUser?._id || buyer?.id || buyer?._id || `buyer-${Date.now()}`);
    const activeBuyerName = currentUser?.name || buyer?.name || 'Valued Buyer';
    const activeBuyerPhone = currentUser?.phone || buyer?.phone || '';

    // 1. Resolve Buyer's Location Details (Village / City / District / Address)
    const buyerLocationObj = {
      address: deliveryAddress,
      city: deliveryCity || currentUser?.city || buyer?.city || 'Local Region',
      district: currentUser?.district || buyer?.district || 'Tamil Nadu',
      lat: currentUser?.latitude ?? buyer?.latitude,
      lng: currentUser?.longitude ?? buyer?.longitude,
    };
    const resolvedBuyerCoords = resolveLocationCoordinates(buyerLocationObj);

    // 2. Find Nearest Registered Local Farmer for this Buyer's location
    const nearestResult = findNearestFarmer(resolvedBuyerCoords, allUsers, cart.map((i) => i.product));
    const assignedFarmer = nearestResult?.farmer;
    const computedDistanceKm = nearestResult?.distanceKm ?? primaryFarmDistance;

    const primaryFarmerId = assignedFarmer?.id || assignedFarmer?._id || 'farmer-local';
    const primaryFarmerName = assignedFarmer?.farmName || assignedFarmer?.name || 'Local Village Organic Farm';
    const primaryFarmLocation = assignedFarmer?.farmLocation || assignedFarmer?.city || `${resolvedBuyerCoords.city}, Tamil Nadu`;
    const resolvedDeliveryCity = deliveryCity || resolvedBuyerCoords.city || 'Local Region';

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split('T')[0];

    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: dateStr,
      buyerId: activeBuyerId,
      buyer: activeBuyerId,
      buyerName: activeBuyerName,
      buyerPhone: activeBuyerPhone,
      deliveryCity: resolvedDeliveryCity,
      deliveryAddress: deliveryAddress || `${resolvedDeliveryCity}, Tamil Nadu`,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pay on Delivery' : 'Paid',
      farmerId: primaryFarmerId,
      farmerName: primaryFarmerName,
      farmLocation: primaryFarmLocation,
      farmDistanceKm: computedDistanceKm,
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
        farmerId: item.product.farmerId || primaryFarmerId,
        farmerName: item.product.farmerName || primaryFarmerName,
        farmLocation: item.product.farmLocation || primaryFarmLocation,
        image: item.product.image,
        category: item.product.category,
      })),
      subtotal: parseFloat(cartSubtotal.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      total: parseFloat(cartTotal.toFixed(2)),
      status: 'Pending',
      estimatedDelivery: 'Tomorrow Morning (7:00 AM - 10:00 AM)',
      assignedDeliveryPartner: null,
      timestamps: { placed: `${dateStr}, ${nowStr}` },
      trackingSteps: buildTrackingSteps('Pending', { placed: `${dateStr}, ${nowStr}` }),
      createdAt: new Date().toISOString(),
    };

    let finalOrder = newOrder;
    try {
      const token = localStorage.getItem('farmstore_token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.order) {
            finalOrder = { ...newOrder, ...data.order };
          }
        }
      }
    } catch (e) {
      console.warn('Backend order placement notice:', e.message);
    }

    setAllOrders((prev) => [finalOrder, ...prev]);
    clearCart();
    await fetchOrders();
    return finalOrder;
  };

  // Order Status Transition
  const updateOrderStatus = async (orderId, newStatus) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const token = localStorage.getItem('farmstore_token');
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {}

    setAllOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && ord._id !== orderId) return ord;
        const updatedTimestamps = {
          ...(ord.timestamps || {}),
          [newStatus.toLowerCase().replace(/ /g, '_')]: nowStr,
        };

        let assignedPartner = ord.assignedDeliveryPartner;
        if (currentUser?.role === 'delivery') {
          assignedPartner = {
            id: String(currentUser.id || currentUser._id || ''),
            email: currentUser.email || '',
            name: currentUser.name || 'Local Delivery Partner',
            phone: currentUser.phone || '+91 98412 34567',
            vehicleType: currentUser.vehicleType || 'Eco Delivery Vehicle',
            serviceArea: currentUser.serviceArea || `${currentUser.city || 'Local'} Hub`,
            city: currentUser.city || 'Tamil Nadu',
            region: currentUser.city || 'Tamil Nadu',
          };
        }

        return {
          ...ord,
          status: newStatus,
          assignedDeliveryPartner: assignedPartner,
          timestamps: updatedTimestamps,
          trackingSteps: buildTrackingSteps(newStatus, updatedTimestamps),
        };
      })
    );

    // Reactively refresh orders from backend API
    await fetchOrders();
  };

  const acceptOrderAsFarmer = (orderId) => updateOrderStatus(orderId, 'Accepted');
  const acceptDelivery = (orderId) => updateOrderStatus(orderId, 'Accepted');
  const markOrderReadyForPickup = (orderId) => updateOrderStatus(orderId, 'Ready for Pickup');
  const markOrderPickedUp = (orderId) => updateOrderStatus(orderId, 'Picked Up');
  const markOrderOutForDelivery = (orderId) => updateOrderStatus(orderId, 'Out for Delivery');
  const markOrderDelivered = (orderId) => updateOrderStatus(orderId, 'Delivered');
  const rejectOrder = (orderId) => updateOrderStatus(orderId, 'Rejected');

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    freeDeliveryThreshold,
    primaryFarmDistance,
    orders,
    isLoadingOrders,
    fetchOrders,
    placeOrder,
    acceptOrderAsFarmer,
    acceptDelivery,
    markOrderReadyForPickup,
    markOrderPickedUp,
    markOrderOutForDelivery,
    markOrderDelivered,
    rejectOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
