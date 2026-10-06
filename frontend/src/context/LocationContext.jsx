import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateDistanceKm, getDeliveryTier, TAMIL_NADU_HUBS, getCoordinatesForCity, resolveLocationCoordinates } from '../utils/distance';

const LocationContext = createContext();

const DEFAULT_BUYER_LOCATION = {
  city: 'Coimbatore',
  district: 'Coimbatore',
  state: 'Tamil Nadu',
  address: 'RS Puram, Coimbatore - 641002',
  lat: 11.0168,
  lng: 76.9558,
  pincode: '641002',
  isGps: false,
};

export const LocationProvider = ({ children }) => {
  // Stored Buyer Location
  const [buyerLocation, setBuyerLocation] = useState(() => {
    const saved = localStorage.getItem('farmstore_buyer_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_BUYER_LOCATION;
      }
    }
    return DEFAULT_BUYER_LOCATION;
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Radius Filter: 'all', 5, 10, 25, 50 (in km)
  const [radiusFilter, setRadiusFilter] = useState('all');

  // Location-based Sorting (Default: 'nearest')
  const [locationSort, setLocationSort] = useState('nearest');

  // Save location changes to localStorage
  useEffect(() => {
    localStorage.setItem('farmstore_buyer_location', JSON.stringify(buyerLocation));
  }, [buyerLocation]);

  // Request browser geolocation
  const requestCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Find nearest known Tamil Nadu city hub
        let nearestHub = TAMIL_NADU_HUBS[0];
        let minD = Infinity;

        TAMIL_NADU_HUBS.forEach((hub) => {
          const d = calculateDistanceKm(userLat, userLng, hub.lat, hub.lng);
          if (d !== null && d < minD) {
            minD = d;
            nearestHub = hub;
          }
        });

        const detected = {
          city: minD < 20 ? nearestHub.city : 'Current GPS Location',
          district: nearestHub.district || 'Tamil Nadu',
          state: 'Tamil Nadu',
          address: minD < 20 ? `${nearestHub.city}, Tamil Nadu (GPS Detected)` : `GPS (${userLat.toFixed(3)}, ${userLng.toFixed(3)})`,
          lat: userLat,
          lng: userLng,
          pincode: nearestHub.pincode || '641001',
          isGps: true,
          accuracyMeters: position.coords.accuracy,
        };

        setBuyerLocation(detected);
        setIsLocating(false);
        setIsLocationModalOpen(false);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can select your city manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Set location manually from standard hubs or custom village/city/coordinates
  const setManualLocation = (locationData) => {
    let finalLocation = { ...DEFAULT_BUYER_LOCATION };

    if (typeof locationData === 'string') {
      const coords = resolveLocationCoordinates(locationData);
      finalLocation = {
        city: locationData,
        district: coords.district || 'Tamil Nadu',
        state: 'Tamil Nadu',
        address: `${locationData}, Tamil Nadu`,
        lat: coords.lat,
        lng: coords.lng,
        pincode: '628501',
        isGps: false,
      };
    } else if (locationData) {
      const coords = resolveLocationCoordinates(locationData);
      finalLocation = {
        city: locationData.city || coords.city || DEFAULT_BUYER_LOCATION.city,
        district: locationData.district || coords.district || 'Tamil Nadu',
        state: locationData.state || 'Tamil Nadu',
        address: locationData.address || `${locationData.city || coords.city}, Tamil Nadu`,
        lat: coords.lat,
        lng: coords.lng,
        pincode: locationData.pincode || DEFAULT_BUYER_LOCATION.pincode,
        isGps: !!locationData.isGps,
      };
    }

    setBuyerLocation(finalLocation);
    setLocationError('');
    setIsLocationModalOpen(false);
  };

  // Calculate real distance in km for any product
  const getProductDistance = (product) => {
    if (!product) return null;

    let farmLat = product.latitude ?? product.lat;
    let farmLng = product.longitude ?? product.lng;

    // If coordinates are missing on product, resolve from farmer location string
    if (farmLat === undefined || farmLat === null || farmLng === undefined || farmLng === null) {
      const cityLookup = getCoordinatesForCity(product.farmLocation || product.farmerName || 'Coimbatore');
      farmLat = cityLookup.lat;
      farmLng = cityLookup.lng;
    }

    return calculateDistanceKm(buyerLocation.lat, buyerLocation.lng, farmLat, farmLng);
  };

  // Get full delivery tier for a product
  const getProductDeliveryInfo = (product) => {
    const distanceKm = getProductDistance(product);
    const tier = getDeliveryTier(distanceKm);
    return {
      distanceKm,
      ...tier,
    };
  };

  return (
    <LocationContext.Provider
      value={{
        buyerLocation,
        isLocating,
        locationError,
        isLocationModalOpen,
        setIsLocationModalOpen,
        radiusFilter,
        setRadiusFilter,
        locationSort,
        setLocationSort,
        requestCurrentLocation,
        setManualLocation,
        getProductDistance,
        getProductDeliveryInfo,
        TAMIL_NADU_HUBS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
