import { dbStore, isFarmerOrderLocationMatch } from '../store/dataStore.js';
import PDFDocument from 'pdfkit';

// Helper to build 7-stage tracking steps
const buildTrackingSteps = (status, timestamps = {}) => {
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

// Regional Delivery Partner Fleet Pool
const DELIVERY_PARTNERS_POOL = [
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

// @desc    Get logged in buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Buyer only)
export const getMyOrders = async (req, res) => {
  try {
    const buyerId = String(req.user?.id || req.user?._id || '');
    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Buyer ID missing in session token.',
      });
    }
    const orders = await dbStore.getOrdersByBuyer(buyerId, req.user);

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your orders: ' + error.message,
    });
  }
};

// @desc    Get logged in farmer's relevant orders
// @route   GET /api/orders/farmer-orders
// @access  Private (Farmer only)
export const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id || req.user._id;
    const rawOrders = await dbStore.getOrdersByFarmer(farmerId, req.user);

    // Ensure farmer sees relevant items (or all items if order routed to their local hub)
    const farmerOrders = rawOrders.map((order) => {
      const myItems = order.items?.filter(
        (item) => item.farmerId === farmerId || 
                  item.farmer === farmerId || 
                  String(item.farmer) === String(farmerId) ||
                  item.farmerName === req.user?.name ||
                  (req.user?.farmName && item.farmerName === req.user?.farmName)
      );

      return {
        ...order,
        items: myItems && myItems.length > 0 ? myItems : order.items,
      };
    });

    res.json({
      success: true,
      count: farmerOrders.length,
      orders: farmerOrders,
    });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching customer orders: ' + error.message,
    });
  }
};

// @desc    Get assigned delivery partner orders
// @route   GET /api/orders/delivery-orders
// @access  Private (Delivery Partner only)
export const getDeliveryOrders = async (req, res) => {
  try {
    const partnerId = String(req.user.id || req.user._id || 'delivery-1');
    const orders = await dbStore.getOrdersByDeliveryPartner(partnerId, req.user);

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching delivery orders: ' + error.message,
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Private (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await dbStore.getAllOrders();

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching all orders: ' + error.message,
    });
  }
};

// @desc    Get single order by ID with ownership verification
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await dbStore.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    // Ownership check
    const isOwnerBuyer = order.buyerId === userId || order.buyer === userId || String(order.buyer) === String(userId);
    const isOwnerFarmer =
      order.farmerId === userId ||
      order.farmer === userId ||
      (userRole === 'farmer' && isFarmerOrderLocationMatch(req.user, order)) ||
      order.items?.some((item) => item.farmerId === userId || item.farmer === userId);
    const isAssignedDelivery = order.assignedDeliveryPartner?.id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwnerBuyer && !isOwnerFarmer && !isAssignedDelivery && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this order.',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order: ' + error.message,
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer only)
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      deliveryCity = 'Coimbatore',
      paymentMethod = 'UPI / QR Payment',
      subtotal,
      deliveryFee = 0,
      total,
      buyerLocation,
      farmDistanceKm = 0,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order with an empty cart.',
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid delivery address.',
      });
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split('T')[0];

    const primaryItem = items[0] || {};
    let primaryFarmerId = req.body.farmerId || primaryItem?.farmerId || 'farmer-1';
    let primaryFarmerName = req.body.farmerName || primaryItem?.farmerName || 'Local Organic Farm';
    let primaryFarmLocation = req.body.farmLocation || primaryItem?.farmLocation || `${deliveryCity}, Tamil Nadu`;

    // Validate that the assigned farmer exists in MySQL database
    try {
      const existingFarmer = await dbStore.findUserById(primaryFarmerId);
      if (existingFarmer && existingFarmer.role === 'farmer') {
        primaryFarmerId = existingFarmer.id || existingFarmer._id;
        primaryFarmerName = existingFarmer.farmName || existingFarmer.name;
        primaryFarmLocation = existingFarmer.farmLocation || `${existingFarmer.city || deliveryCity}, Tamil Nadu`;
      } else {
        const allUsers = await dbStore.getAllUsers();
        const farmers = allUsers.filter((u) => u.role === 'farmer');
        const locMatchText = `${deliveryCity} ${deliveryAddress} ${primaryFarmLocation}`.toLowerCase();
        let matched = farmers.find((f) => locMatchText.includes(f.city?.toLowerCase() || '---') || (f.farmLocation && locMatchText.includes(f.farmLocation.toLowerCase())));
        if (!matched) {
          if (locMatchText.includes('kovilpatti') || locMatchText.includes('guruvarpatti') || locMatchText.includes('thoothukudi') || locMatchText.includes('tuticorin')) {
            matched = farmers.find((f) => f.city?.toLowerCase().includes('kovilpatti') || f.id === 'farmer-11') || farmers[0];
          } else {
            matched = farmers.find((f) => f.city?.toLowerCase().includes('coimbatore') || f.id === 'farmer-1') || farmers[0];
          }
        }
        if (matched) {
          primaryFarmerId = matched.id || matched._id;
          primaryFarmerName = matched.farmName || matched.name;
          primaryFarmLocation = matched.farmLocation || `${matched.city || deliveryCity}, Tamil Nadu`;
        }
      }
    } catch (farmErr) {
      console.warn('Farmer resolution notice:', farmErr.message);
    }

    const activeBuyerId = String(req.user?.id || req.user?._id || req.body.buyerId || req.body.buyer || `buyer-${Date.now()}`);
    const activeBuyerName = req.user?.name || req.body.buyerName || 'Valued Buyer';
    const activeBuyerPhone = req.user?.phone || req.body.buyerPhone || '+91 97100 67890';

    const timestamps = req.body.timestamps || { placed: `${dateStr}, ${nowStr}` };

    const orderData = {
      id: req.body.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: dateStr,
      buyer: activeBuyerId,
      buyerId: activeBuyerId,
      buyerName: activeBuyerName,
      buyerPhone: activeBuyerPhone,
      deliveryCity,
      deliveryAddress,
      buyerLocation: buyerLocation || {
        city: deliveryCity,
        address: deliveryAddress,
        lat: req.user?.latitude || null,
        lng: req.user?.longitude || null,
      },
      farmer: req.body.farmer || primaryFarmerId,
      farmerId: primaryFarmerId,
      farmerName: primaryFarmerName,
      farmLocation: primaryFarmLocation,
      farmDistanceKm: Number(farmDistanceKm) || 0,
      items: items.map((item) => ({
        id: item.id || item.product?.id || `item-${Date.now()}`,
        name: item.name || item.product?.name,
        price: Number(item.price || item.product?.price || 0),
        quantity: Number(item.quantity || 1),
        unit: item.unit || item.product?.unit || 'kg',
        farmer: item.farmer || item.product?.farmer || item.farmerId || primaryFarmerId,
        farmerId: item.farmerId || item.product?.farmerId || primaryFarmerId,
        farmerName: item.farmerName || item.product?.farmerName || primaryFarmerName,
        farmLocation: item.farmLocation || item.product?.farmLocation || primaryFarmLocation,
        image: item.image || item.product?.image || '',
        category: item.category || item.product?.category || '',
      })),
      subtotal: Number(subtotal) || items.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0),
      deliveryFee: Number(deliveryFee) || 0,
      total: Number(total) || (Number(subtotal) || 0) + (Number(deliveryFee) || 0),
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pay on Delivery' : 'Paid',
      status: 'Pending',
      estimatedDelivery: 'Tomorrow Morning (7:00 AM - 10:00 AM)',
      assignedDeliveryPartner: null,
      timestamps,
      trackingSteps: buildTrackingSteps('Pending', timestamps),
    };

    const newOrder = await dbStore.createOrder(orderData);
    const safeOrder = newOrder && typeof newOrder.toObject === 'function' ? newOrder.toObject() : { ...newOrder };

    res.status(201).json({
      success: true,
      message: 'Order placed successfully and stored in MongoDB!',
      order: safeOrder,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error placing order: ' + error.message,
    });
  }
};

// @desc    Update order status workflow (Farmer Accept, Ready for pickup, Pickup, Out for delivery, Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await dbStore.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const userId = String(req.user?.id || req.user?._id || '');
    const userRole = req.user?.role || (req.body.role || 'farmer');

    // Check authorization for status change
    let assignedPartner = order.assignedDeliveryPartner;

    if (userRole === 'farmer') {
      const isMyFarm =
        !userId ||
        order.farmerId === userId ||
        order.farmer === userId ||
        isFarmerOrderLocationMatch(req.user, order) ||
        order.items?.some((item) => item.farmerId === userId || item.farmer === userId);

      if (!isMyFarm && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot modify orders from another farm.',
        });
      }

      // When farmer accepts or marks ready for pickup, leave assignedPartner open for the local regional fleet
      // unless already claimed by a specific partner.
        } else if (userRole === 'delivery') {
      const partnerIdStr = String(userId || '');
      const partnerEmail = String(req.user?.email || '').toLowerCase().trim();
      const orderAssignedId = String(order.assignedDeliveryPartner?.id || order.assignedDeliveryPartner?._id || '');
      const orderAssignedEmail = String(order.assignedDeliveryPartner?.email || '').toLowerCase().trim();

      const isUnassigned = !orderAssignedId && !orderAssignedEmail;
      const isAssignedToMe =
        orderAssignedId === partnerIdStr ||
        (partnerEmail && orderAssignedEmail === partnerEmail);

      if (!isUnassigned && !isAssignedToMe && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: This delivery is already claimed by another partner.',
        });
      }

      // Assign the specific delivery partner who accepted / picked up the order
      assignedPartner = {
        id: partnerIdStr,
        email: partnerEmail,
        name: req.user.name || 'Local Logistics Partner',
        phone: req.user.phone || '+91 98412 34567',
        vehicleType: req.user.vehicleType || 'Eco Delivery Vehicle',
        serviceArea: req.user.serviceArea || `${req.user.city || 'Regional'} Hub`,
        region: req.user.region || req.user.city || 'Tamil Nadu',
        city: req.user.city || req.user.region || 'Tamil Nadu',
      };
    }

    const updatedOrder = await dbStore.updateOrderStatus(order.id || order._id, status, assignedPartner);
    updatedOrder.trackingSteps = buildTrackingSteps(status, updatedOrder.timestamps);

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status: ' + error.message,
    });
  }
};

// @desc    Generate and download authenticated PDF receipt for an order
// @route   GET /api/orders/:id/receipt
// @access  Private (Buyer Owner or Admin only)
export const downloadOrderReceipt = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await dbStore.findOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID "${orderId}" not found.`,
      });
    }

    // STRICT SECURITY AUTHORIZATION CHECK:
    // Only the buyer who owns the order or a system admin can download this receipt
    const currentUserId = String(req.user?.id || req.user?._id || '').trim();
    const currentUserEmail = String(req.user?.email || '').toLowerCase().trim();
    const currentUserName = String(req.user?.name || '').toLowerCase().trim();
    const orderBuyerId = String(order.buyerId || order.buyer || '').trim();
    const orderBuyerEmail = String(order.buyerEmail || '').toLowerCase().trim();
    const orderBuyerName = String(order.buyerName || '').toLowerCase().trim();
    const isAdmin = req.user?.role === 'admin';

    const isOwner = (orderBuyerId && (orderBuyerId === currentUserId || orderBuyerId === String(req.user?._id))) ||
                    (currentUserEmail && orderBuyerEmail && currentUserEmail === orderBuyerEmail) ||
                    (currentUserEmail && orderBuyerName && (currentUserEmail.includes(orderBuyerName.replace(/\s+/g, '')) || orderBuyerName.includes(currentUserEmail))) ||
                    (currentUserName && orderBuyerName && (currentUserName.includes(orderBuyerName) || orderBuyerName.includes(currentUserName))) ||
                    (req.user?.role === 'buyer' && (!orderBuyerId || orderBuyerId === currentUserId || (currentUserName && currentUserName === orderBuyerName)));

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access denied. You can only download receipts for your own orders.',
      });
    }

    // Fetch buyer profile email if not directly in order object
    let buyerEmail = order.buyerEmail || req.user?.email || '';
    if (!buyerEmail && order.buyerId) {
      const buyerUser = await dbStore.findUserById(order.buyerId);
      if (buyerUser?.email) buyerEmail = buyerUser.email;
    }

    // Prepare PDF Document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: `FarmerMarket_Receipt_${order.id}`,
        Author: 'Farmer Market Web Portal',
        Subject: `Receipt for Order ${order.id}`,
      },
    });

    const safeFilename = `FarmerMarket_Receipt_${order.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    doc.pipe(res);

    // ================= HEADER SECTION =================
    // Top Green Brand Banner
    doc.rect(40, 40, 515, 6).fill('#15803d'); // Emerald Farm Green

    // Brand Title
    doc.fillColor('#14532d').fontSize(22).font('Helvetica-Bold').text('FARMER MARKET', 40, 58);
    doc.fillColor('#4b5563').fontSize(9).font('Helvetica').text('Fresh Farm-to-Table Direct Harvest Portal • Tamil Nadu, India', 40, 84);

    // Receipt Badge
    doc.rect(410, 56, 145, 26).fill('#ecfdf5');
    doc.strokeColor('#10b981').lineWidth(1).rect(410, 56, 145, 26).stroke();
    doc.fillColor('#065f46').fontSize(11).font('Helvetica-Bold').text('ORDER RECEIPT', 422, 63);

    // Divider
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(40, 105).lineTo(555, 105).stroke();

    // ================= ORDER META & DETAILS =================
    doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('Order ID:', 40, 118);
    doc.fillColor('#15803d').font('Helvetica-Bold').text(order.id, 95, 118);

    doc.fillColor('#111827').font('Helvetica-Bold').text('Order Date:', 40, 134);
    doc.fillColor('#4b5563').font('Helvetica').text(order.date || new Date().toLocaleDateString('en-IN'), 105, 134);

    doc.fillColor('#111827').font('Helvetica-Bold').text('Order Status:', 340, 118);
    doc.fillColor('#15803d').font('Helvetica-Bold').text(order.status || 'Confirmed', 415, 118);

    doc.fillColor('#111827').font('Helvetica-Bold').text('Payment Method:', 340, 134);
    doc.fillColor('#4b5563').font('Helvetica').text(order.paymentMethod || 'UPI / QR Payment', 432, 134);

    // ================= BUYER & FARMER CARDS =================
    // Buyer Details Box
    doc.rect(40, 160, 245, 95).fill('#f9fafb');
    doc.strokeColor('#e5e7eb').lineWidth(1).rect(40, 160, 245, 95).stroke();
    doc.fillColor('#15803d').fontSize(10).font('Helvetica-Bold').text('BUYER DETAILS', 52, 172);
    doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold').text(order.buyerName || 'Valued Customer', 52, 190);
    doc.fillColor('#4b5563').font('Helvetica').text(`Email: ${buyerEmail || 'customer@farmer.market'}`, 52, 204);
    doc.fillColor('#4b5563').font('Helvetica').text(`Delivery Address: ${order.deliveryAddress || order.deliveryCity || 'Coimbatore, Tamil Nadu'}`, 52, 218, { width: 220 });

    // Farmer Details Box
    doc.rect(310, 160, 245, 95).fill('#f9fafb');
    doc.strokeColor('#e5e7eb').lineWidth(1).rect(310, 160, 245, 95).stroke();
    doc.fillColor('#15803d').fontSize(10).font('Helvetica-Bold').text('FARMER / PRODUCER', 322, 172);
    doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold').text(order.farmerName || 'Verified Organic Farm', 322, 190);
    doc.fillColor('#4b5563').font('Helvetica').text(`Origin: ${order.farmLocation || 'Tamil Nadu Farm Belt'}`, 322, 204);
    doc.fillColor('#4b5563').font('Helvetica').text(`Distance: ${order.farmDistanceKm || 12} km direct farm dispatch`, 322, 218);

    // ================= ITEMS TABLE =================
    const tableTop = 275;
    // Table Header
    doc.rect(40, tableTop, 515, 24).fill('#15803d');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('ITEM DESCRIPTION', 52, tableTop + 7);
    doc.text('UNIT PRICE', 290, tableTop + 7, { width: 70, align: 'right' });
    doc.text('QTY', 375, tableTop + 7, { width: 45, align: 'center' });
    doc.text('AMOUNT', 450, tableTop + 7, { width: 90, align: 'right' });

    let currentY = tableTop + 24;
    const items = Array.isArray(order.items) ? order.items : [];

    items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        doc.rect(40, currentY, 515, 24).fill('#fcfcfc');
      }
      doc.strokeColor('#f3f4f6').lineWidth(1).moveTo(40, currentY + 24).lineTo(555, currentY + 24).stroke();

      const itemQty = Number(item.quantity || item.qty || 1);
      const itemPrice = Number(item.price || 0);
      const lineTotal = itemQty * itemPrice;

      doc.fillColor('#1f2937').fontSize(9).font('Helvetica');
      doc.text(item.name || `Produce Item ${index + 1}`, 52, currentY + 7, { width: 230 });
      doc.text(`INR ${itemPrice.toFixed(2)}`, 290, currentY + 7, { width: 70, align: 'right' });
      doc.text(`${itemQty} ${item.unit || 'kg'}`, 375, currentY + 7, { width: 45, align: 'center' });
      doc.font('Helvetica-Bold').text(`INR ${lineTotal.toFixed(2)}`, 450, currentY + 7, { width: 90, align: 'right' });

      currentY += 24;
    });

    // ================= SUMMARY SECTION =================
    currentY += 10;
    const summaryX = 350;
    const valueX = 465;

    doc.fillColor('#4b5563').fontSize(9).font('Helvetica').text('Subtotal:', summaryX, currentY);
    doc.fillColor('#111827').font('Helvetica-Bold').text(`INR ${Number(order.subtotal || 0).toFixed(2)}`, valueX, currentY, { width: 75, align: 'right' });

    currentY += 16;
    doc.fillColor('#4b5563').font('Helvetica').text('Delivery Charge:', summaryX, currentY);
    doc.fillColor('#111827').font('Helvetica-Bold').text(`INR ${Number(order.deliveryFee || 0).toFixed(2)}`, valueX, currentY, { width: 75, align: 'right' });

    currentY += 18;
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(summaryX, currentY).lineTo(555, currentY).stroke();

    currentY += 6;
    doc.rect(summaryX - 5, currentY - 2, 210, 26).fill('#ecfdf5');
    doc.fillColor('#15803d').fontSize(11).font('Helvetica-Bold').text('Total Amount Paid:', summaryX + 5, currentY + 6);
    doc.text(`INR ${Number(order.total || 0).toFixed(2)}`, valueX - 5, currentY + 6, { width: 80, align: 'right' });

    // ================= THANK YOU & FOOTER =================
    const footerY = 670;
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(40, footerY).lineTo(555, footerY).stroke();

    doc.fillColor('#15803d').fontSize(11).font('Helvetica-Bold').text('Thank you for shopping with Farmer Market!', 40, footerY + 12, { align: 'center' });
    doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text('100% Certified Organic • Direct Harvest • Fair Prices for Farmers', 40, footerY + 28, { align: 'center' });
    doc.text('This is a computer-generated official receipt. No physical signature is required.', 40, footerY + 40, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error generating PDF receipt: ' + error.message,
      });
    }
  }
};
