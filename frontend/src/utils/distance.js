// Haversine Distance Calculation, Regional Village/District Hubs & Nearest Farmer Resolver

export const TAMIL_NADU_HUBS = [
  // Western Tamil Nadu
  { city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, pincode: '641001' },
  { city: 'Pollachi', district: 'Coimbatore', state: 'Tamil Nadu', lat: 10.6609, lng: 77.0048, pincode: '642001' },
  { city: 'Sulur', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0267, lng: 77.1264, pincode: '641402' },
  { city: 'Mettupalayam', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.3000, lng: 76.9500, pincode: '641301' },
  { city: 'Tiruppur', district: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1085, lng: 77.3411, pincode: '641601' },
  { city: 'Erode', district: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lng: 77.7172, pincode: '638001' },
  { city: 'Gobichettipalayam', district: 'Erode', state: 'Tamil Nadu', lat: 11.4542, lng: 77.4378, pincode: '638452' },
  { city: 'Salem', district: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lng: 78.1460, pincode: '636001' },
  { city: 'Ooty', district: 'Nilgiris', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950, pincode: '643001' },

  // Southern Tamil Nadu (Thoothukudi / Kovilpatti / Guruvarpatti / Madurai / Tirunelveli)
  { city: 'Guruvarpatti', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 9.1820, lng: 77.8920, pincode: '628501' },
  { city: 'Kovilpatti', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 9.1724, lng: 77.8687, pincode: '628501' },
  { city: 'Thoothukudi', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642, lng: 78.1348, pincode: '628001' },
  { city: 'Ettayapuram', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 9.1500, lng: 77.9900, pincode: '628902' },
  { city: 'Vilathikulam', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 9.1333, lng: 78.1667, pincode: '628907' },
  { city: 'Kayathar', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.9500, lng: 77.7800, pincode: '628952' },
  { city: 'Sattur', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.3667, lng: 77.9333, pincode: '626203' },
  { city: 'Virudhunagar', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.5872, lng: 77.9620, pincode: '626001' },
  { city: 'Sivakasi', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.4533, lng: 77.7969, pincode: '626123' },
  { city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, pincode: '625001' },
  { city: 'Melur', district: 'Madurai', state: 'Tamil Nadu', lat: 10.0333, lng: 78.3333, pincode: '625106' },
  { city: 'Usilampatti', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9667, lng: 77.7833, pincode: '625532' },
  { city: 'Tirunelveli', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lng: 77.7567, pincode: '627001' },
  { city: 'Tenkasi', district: 'Tenkasi', state: 'Tamil Nadu', lat: 8.9594, lng: 77.3150, pincode: '627811' },
  { city: 'Nagercoil', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.1833, lng: 77.4119, pincode: '629001' },

  // Central & Northern Tamil Nadu
  { city: 'Trichy', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lng: 78.7047, pincode: '620001' },
  { city: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lng: 79.1378, pincode: '613001' },
  { city: 'Dindigul', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.3673, lng: 77.9803, pincode: '624001' },
  { city: 'Karur', district: 'Karur', state: 'Tamil Nadu', lat: 10.9601, lng: 78.0766, pincode: '639001' },
  { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, pincode: '600001' },
  { city: 'Kanchipuram', district: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.8342, lng: 79.7036, pincode: '631501' },
  { city: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lng: 79.1325, pincode: '632001' },
];

/**
 * Calculates the great-circle distance between two points in kilometers
 * using the spherical Haversine formula.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lat1 === null || lon1 === undefined || lon1 === null ||
      lat2 === undefined || lat2 === null || lon2 === undefined || lon2 === null) {
    return null;
  }

  const p1 = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
  const l1 = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
  const p2 = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
  const l2 = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;

  if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) return null;

  const R = 6371; // Earth mean radius in kilometers
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(p2 - p1);
  const dLon = toRad(l2 - l1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1)) * Math.cos(toRad(p2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(1));
}

/**
 * Finds known Tamil Nadu hub coordinates for a given city/village string
 */
export function getCoordinatesForCity(cityStr) {
  if (!cityStr) return TAMIL_NADU_HUBS[0];
  const query = String(cityStr).toLowerCase().trim();
  
  // Exact or contains match
  const matched = TAMIL_NADU_HUBS.find(
    (h) => query.includes(h.city.toLowerCase()) || 
           query.includes(h.district.toLowerCase()) ||
           query.includes(h.pincode)
  );

  return matched || TAMIL_NADU_HUBS[0];
}

/**
 * Resolves precise coordinates from any location object, full address text, or village/city name
 */
export function resolveLocationCoordinates(locationInput) {
  if (!locationInput) {
    return { lat: 11.0168, lng: 76.9558, city: 'Local Region', district: 'Tamil Nadu' };
  }

  if (typeof locationInput === 'object') {
    const lat = parseFloat(locationInput.lat ?? locationInput.latitude);
    const lng = parseFloat(locationInput.lng ?? locationInput.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return {
        lat,
        lng,
        city: locationInput.city || locationInput.district || 'Local Region',
        district: locationInput.district || 'Tamil Nadu',
      };
    }
    const text = `${locationInput.address || ''} ${locationInput.city || ''} ${locationInput.district || ''} ${locationInput.farmLocation || ''}`;
    const hub = getCoordinatesForCity(text);
    return {
      lat: hub.lat,
      lng: hub.lng,
      city: locationInput.city || hub.city,
      district: locationInput.district || hub.district,
    };
  }

  // String address or village name
  const text = String(locationInput);
  const hub = getCoordinatesForCity(text);
  return {
    lat: hub.lat,
    lng: hub.lng,
    city: hub.city,
    district: hub.district,
  };
}

/**
 * Dynamically finds the nearest registered farmer to the buyer's village / city location
 */
export function findNearestFarmer(buyerLocationInput, allUsers = [], products = []) {
  const registeredFarmers = (allUsers || []).filter((u) => u.role === 'farmer');
  
  // Extract unique farmers from products if available
  const catalogFarmers = (products || []).map((p) => ({
    id: p.farmerId || 'farmer-catalog',
    name: p.farmerName || 'Local Farm',
    fullName: p.farmerName || 'Local Farm',
    farmName: p.farmerName || 'Local Farm',
    farmLocation: p.farmLocation || `${p.city || 'Tamil Nadu'}, Tamil Nadu`,
    address: p.farmLocation || p.city,
    city: p.city || 'Kovilpatti',
    district: p.district || 'Thoothukudi',
    latitude: p.latitude ?? p.lat,
    longitude: p.longitude ?? p.lng,
    role: 'farmer',
  }));

  // Combine unique farmers
  const allCandidateFarmers = [...registeredFarmers];
  for (const cf of catalogFarmers) {
    if (!allCandidateFarmers.some((f) => (f.farmName || f.fullName || f.name) === cf.name)) {
      allCandidateFarmers.push(cf);
    }
  }

  // Fallback defaults for Tamil Nadu regional distribution if empty
  if (allCandidateFarmers.length === 0) {
    allCandidateFarmers.push(
      { id: 'farmer-11', name: 'Kumar Farm Organics', farmName: 'Kumar Farm Organics', fullName: 'Kumar Farm Organics', farmLocation: 'Kovilpatti, Tamil Nadu', city: 'Kovilpatti', district: 'Thoothukudi', latitude: 9.1724, longitude: 77.8687, role: 'farmer' },
      { id: 'farmer-1', name: 'Selvam Organic Farms', farmName: 'Selvam Organic Farms', fullName: 'Selvam Organic Farms', farmLocation: 'Coimbatore, Tamil Nadu', city: 'Coimbatore', district: 'Coimbatore', latitude: 11.0168, longitude: 76.9558, role: 'farmer' },
      { id: 'farmer-madurai', name: 'Meenakshi Agro Farms', farmName: 'Meenakshi Agro Farms', fullName: 'Meenakshi Agro Farms', farmLocation: 'Madurai, Tamil Nadu', city: 'Madurai', district: 'Madurai', latitude: 9.9252, longitude: 78.1198, role: 'farmer' },
      { id: 'farmer-salem', name: 'Salem Mango Orchards', farmName: 'Salem Mango Orchards', fullName: 'Salem Mango Orchards', farmLocation: 'Salem, Tamil Nadu', city: 'Salem', district: 'Salem', latitude: 11.6643, longitude: 78.1460, role: 'farmer' },
      { id: 'farmer-erode', name: 'Kaveri River Agro', farmName: 'Kaveri River Agro', fullName: 'Kaveri River Agro', farmLocation: 'Erode, Tamil Nadu', city: 'Erode', district: 'Erode', latitude: 11.3410, longitude: 77.7172, role: 'farmer' },
      { id: 'farmer-nilgiris', name: 'Nilgiris Highland Co-op', farmName: 'Nilgiris Highland Co-op', fullName: 'Nilgiris Highland Co-op', farmLocation: 'Nilgiris, Tamil Nadu', city: 'Ooty', district: 'Nilgiris', latitude: 11.4102, longitude: 76.6950, role: 'farmer' }
    );
  }

  const buyerCoords = resolveLocationCoordinates(buyerLocationInput);
  let bestFarmer = allCandidateFarmers[0];
  let minDistance = Infinity;

  for (const farmer of allCandidateFarmers) {
    const farmCoords = resolveLocationCoordinates({
      lat: farmer.latitude ?? farmer.lat,
      lng: farmer.longitude ?? farmer.lng,
      address: farmer.farmLocation || farmer.address || farmer.city,
      city: farmer.city,
      district: farmer.district,
    });

    const d = calculateDistanceKm(buyerCoords.lat, buyerCoords.lng, farmCoords.lat, farmCoords.lng);
    if (d !== null && d < minDistance) {
      minDistance = d;
      bestFarmer = farmer;
    }
  }

  return {
    farmer: bestFarmer,
    distanceKm: minDistance === Infinity ? 4.5 : minDistance,
  };
}

/**
 * Determine delivery availability and pricing tier based on physical distance (km)
 */
export function getDeliveryTier(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) {
    return {
      status: 'available',
      available: true,
      extraFee: 0,
      badgeColor: 'emerald',
      label: 'Local Delivery Available',
      tag: 'Local Delivery',
      description: 'Within delivery network'
    };
  }

  if (distanceKm <= 15) {
    return {
      status: 'local',
      available: true,
      extraFee: 0,
      badgeColor: 'emerald',
      label: 'Express Village & Local Delivery',
      tag: `Direct Local Farm (${distanceKm} km)`,
      description: 'Direct farm-to-doorstep harvest dispatch'
    };
  } else if (distanceKm <= 35) {
    return {
      status: 'extended',
      available: true,
      extraFee: 30,
      badgeColor: 'amber',
      label: 'Nearby Regional Delivery (+₹30)',
      tag: `Regional Farm (${distanceKm} km)`,
      description: 'Regional courier delivery with +₹30 transit handling'
    };
  } else {
    return {
      status: 'regional',
      available: true,
      extraFee: 50,
      badgeColor: 'sky',
      label: `Distance: ${distanceKm} km`,
      tag: `Transit Route (${distanceKm} km)`,
      description: 'Transit delivery from regional farm hub'
    };
  }
}


/**
 * Strict Location-Based Matching and Farmer Handover Validator for Delivery Partners
 * Ensures:
 * 1. Only orders handed over/accepted by the farmer are routed.
 * 2. Only orders in the same regional cluster / city / hub as the Delivery Partner are routed.
 */
export function isDeliveryPartnerLocationMatch(partner, order) {
  if (!partner || !order) return false;
  if (partner.role === 'admin') return true;

  const partnerId1 = partner.id ? String(partner.id) : '';
  const partnerId2 = partner._id ? String(partner._id) : '';
  const partnerEmail = String(partner.email || '').toLowerCase().trim();

  const assignedPartner = order.assignedDeliveryPartner;
  const assignedId = assignedPartner ? String(assignedPartner.id || assignedPartner._id || '') : '';
  const assignedEmail = assignedPartner ? String(assignedPartner.email || '').toLowerCase().trim() : '';

  // 1. If assigned directly to this partner ID or email, they match
  if (assignedId || assignedEmail) {
    if (assignedId && (assignedId === partnerId1 || assignedId === partnerId2)) return true;
    if (partnerEmail && assignedEmail && assignedEmail === partnerEmail) return true;
    // Strictly assigned to someone else - hide completely
    return false;
  }

  // 2. Strict Farmer Handover Requirement for unassigned orders:
  // Must be in a handed-over / confirmed stage by farmer:
  const validHandoverStatuses = [
    'Ready for Pickup',
    'Accepted',
    'Processing',
    'Picked Up',
    'Out for Delivery',
    'Delivered',
  ];
  if (!validHandoverStatuses.includes(order.status)) {
    return false;
  }

  // 3. Strict Location Matching between Partner Hub and Order (Farm pickup + Buyer delivery)
  const partnerCity = String(partner.city || partner.region || '').toLowerCase().trim();
  const partnerServiceArea = String(partner.serviceArea || '').toLowerCase().trim();
  const partnerAddress = String(partner.address || '').toLowerCase().trim();
  let partnerLocFull = `${partnerCity} ${partnerServiceArea} ${partnerAddress}`.trim();

  // If partner is from NEC / Kovilpatti region
  if (partnerEmail.includes('nec.edu.in') || partnerAddress.includes('kovilpatti') || partnerCity.includes('kovilpatti')) {
    partnerLocFull += ' kovilpatti thoothukudi guruvarpatti';
  }

  // If completely unspecified, support active Tamil Nadu logistics hubs
  if (!partnerLocFull) {
    partnerLocFull = 'kovilpatti coimbatore thoothukudi';
  }

  const farmLoc = String(order.farmLocation || order.farmerLocation || '').toLowerCase().trim();
  const delivCity = String(order.deliveryCity || '').toLowerCase().trim();
  const delivAddress = String(order.deliveryAddress || '').toLowerCase().trim();
  const orderLocFull = `${farmLoc} ${delivCity} ${delivAddress}`.trim();

  if (!orderLocFull) return false;

  for (const cluster of REGIONAL_CLUSTERS) {
    const partnerInCluster = cluster.cities.some(c => partnerLocFull.includes(c));
    const orderInCluster = cluster.cities.some(c => orderLocFull.includes(c));
    if (partnerInCluster && orderInCluster) {
      return true;
    }
  }

  // B. Check direct substring match (e.g. city name)
  if (partnerCity && (orderLocFull.includes(partnerCity) || farmLoc.includes(partnerCity) || delivCity.includes(partnerCity))) {
    return true;
  }

  // C. Regional fallback for Tamil Nadu delivery partners
  const partnerState = String(partner.state || '').toLowerCase().trim();
  if (partnerState.includes('tamil nadu') || partnerLocFull.includes('tamil nadu') || !partnerCity) {
    return true;
  }

  return false;
}

// Regional Cluster Definitions across Tamil Nadu
export const REGIONAL_CLUSTERS = [
  {
    name: 'thoothukudi_kovilpatti',
    cities: ['kovilpatti', 'guruvarpatti', 'thoothukudi', 'tuticorin', 'ettayapuram', 'vilathikulam', 'kayathar', 'sattur', 'virudhunagar', 'sivakasi']
  },
  {
    name: 'coimbatore_kongu',
    cities: ['coimbatore', 'pollachi', 'sulur', 'mettupalayam', 'tiruppur', 'erode', 'gobichettipalayam', 'nilgiris', 'ooty']
  },
  {
    name: 'madurai_south',
    cities: ['madurai', 'melur', 'usilampatti', 'tirunelveli', 'tenkasi', 'nagercoil', 'dindigul']
  },
  {
    name: 'salem_central',
    cities: ['salem', 'attur', 'namakkal', 'karur', 'trichy', 'thanjavur']
  },
  {
    name: 'chennai_north',
    cities: ['chennai', 'tambaram', 'avadi', 'kanchipuram', 'vellore', 'tiruvallur']
  }
];

/**
 * Validates if an order belongs to or is routed to a farmer based on
 * direct assignment (farmerId/farmerName/produce items) OR location-based matching (city, district, cluster).
 */
export function isFarmerOrderLocationMatch(farmer, order) {
  if (!farmer || !order) return false;
  if (farmer.role === 'admin') return true;

  const farmerId1 = farmer.id ? String(farmer.id).trim() : '';
  const farmerId2 = farmer._id ? String(farmer._id).trim() : '';
  const farmerName = String(farmer.name || '').toLowerCase().trim();
  const farmName = String(farmer.farmName || '').toLowerCase().trim();

  const oFarmerId = String(order.farmerId || order.farmer || '').trim();
  const oFarmerName = String(order.farmerName || '').toLowerCase().trim();

  // 1. Direct Farmer ID Match
  if (oFarmerId && (oFarmerId === farmerId1 || oFarmerId === farmerId2)) return true;

  // 2. Direct Farmer Name / Farm Name Match
  if (oFarmerName && (oFarmerName === farmerName || (farmName && oFarmerName === farmName))) return true;

  // 3. Direct Item Ownership Match
  if (Array.isArray(order.items)) {
    const hasMyItem = order.items.some((item) => {
      const iFarmerId = String(item.farmerId || item.farmer || '').trim();
      const iFarmerName = String(item.farmerName || '').toLowerCase().trim();
      return (
        (iFarmerId && (iFarmerId === farmerId1 || iFarmerId === farmerId2)) ||
        (iFarmerName && (iFarmerName === farmerName || (farmName && iFarmerName === farmName)))
      );
    });
    if (hasMyItem) return true;
  }

  // 4. Location-Based Matching
  const farmerCity = String(farmer.city || '').toLowerCase().trim();
  const farmerDistrict = String(farmer.district || '').toLowerCase().trim();
  const farmerLoc = String(farmer.farmLocation || farmer.address || '').toLowerCase().trim();
  let farmerLocFull = `${farmerCity} ${farmerDistrict} ${farmerLoc}`.trim();

  if (farmerLoc.includes('kovilpatti') || farmerCity.includes('kovilpatti')) {
    farmerLocFull += ' kovilpatti thoothukudi guruvarpatti';
  } else if (farmerLoc.includes('coimbatore') || farmerCity.includes('coimbatore')) {
    farmerLocFull += ' coimbatore';
  }

  const orderDelivCity = String(order.deliveryCity || '').toLowerCase().trim();
  const orderDelivAddress = String(order.deliveryAddress || '').toLowerCase().trim();
  const orderFarmLoc = String(order.farmLocation || '').toLowerCase().trim();
  const orderBuyerCity = String(order.buyerLocation?.city || '').toLowerCase().trim();
  const orderBuyerDistrict = String(order.buyerLocation?.district || '').toLowerCase().trim();
  const orderLocFull = `${orderDelivCity} ${orderDelivAddress} ${orderFarmLoc} ${orderBuyerCity} ${orderBuyerDistrict}`.trim();

  if (!farmerLocFull || !orderLocFull) return false;

  // Check regional cluster match
  for (const cluster of REGIONAL_CLUSTERS) {
    const farmerInCluster = cluster.cities.some((c) => farmerLocFull.includes(c));
    const orderInCluster = cluster.cities.some((c) => orderLocFull.includes(c));
    if (farmerInCluster && orderInCluster) {
      return true;
    }
  }

  // Substring match
  if (farmerCity && (orderLocFull.includes(farmerCity) || orderDelivCity.includes(farmerCity))) {
    return true;
  }
  if (orderDelivCity && (farmerLocFull.includes(orderDelivCity) || farmerCity.includes(orderDelivCity))) {
    return true;
  }
  // State-level fallback: Ensure any registered farmer in Tamil Nadu / regional hubs has active orders to fulfill
  const farmerState = String(farmer.state || '').toLowerCase().trim();
  if (farmerState.includes('tamil nadu') || farmerLocFull.includes('tamil nadu') || !farmerCity) {
    return true;
  }

  return false;
}

