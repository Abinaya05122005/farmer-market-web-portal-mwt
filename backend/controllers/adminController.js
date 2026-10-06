import { getMySQLPool, getIsMySQLConnected } from '../config/mysql.js';
import { dbStore } from '../store/dataStore.js';

// Helper to safely parse JSON columns
const safeParseJSON = (data, fallback = []) => {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

// @desc    Get Admin Dashboard Overview & Real Statistics from MySQL
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboardOverview = async (req, res) => {
  try {
    if (getIsMySQLConnected()) {
      const pool = getMySQLPool();

      // 1. User Counts by Role
      const [userCounts] = await pool.query(`
        SELECT 
          COUNT(*) AS totalUsers,
          SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) AS totalFarmers,
          SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) AS totalBuyers,
          SUM(CASE WHEN role = 'delivery' THEN 1 ELSE 0 END) AS totalDeliveryPartners,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS totalAdmins
        FROM users
      `);

      // 2. Product Counts
      const [productCounts] = await pool.query(`
        SELECT 
          COUNT(*) AS totalProducts,
          SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) AS inStockProducts,
          SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) AS outOfStockProducts,
          SUM(CASE WHEN is_organic = 1 OR isOrganic = 1 THEN 1 ELSE 0 END) AS organicProducts,
          SUM(CASE WHEN (is_organic = 0 OR is_organic IS NULL) AND (isOrganic = 0 OR isOrganic IS NULL) THEN 1 ELSE 0 END) AS nonOrganicProducts
        FROM products
      `);

      // 3. Order Counts & Financial Totals
      const [orderCounts] = await pool.query(`
        SELECT 
          COUNT(*) AS totalOrders,
          SUM(CASE WHEN status IN ('Pending', 'Placed', 'Processing') THEN 1 ELSE 0 END) AS pendingOrders,
          SUM(CASE WHEN status IN ('Accepted', 'Ready for Pickup', 'Picked Up', 'Out for Delivery') THEN 1 ELSE 0 END) AS activeOrders,
          SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledOrders,
          COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END), 0) AS totalRevenue
        FROM orders
      `);

      // 4. Orders Grouped by Status
      const [ordersByStatus] = await pool.query(`
        SELECT status, COUNT(*) AS count 
        FROM orders 
        GROUP BY status
      `);

      // 5. Users Grouped by Role
      const [usersByRole] = await pool.query(`
        SELECT role, COUNT(*) AS count 
        FROM users 
        GROUP BY role
      `);

      // 6. Products Grouped by Category
      const [productsByCategory] = await pool.query(`
        SELECT category, COUNT(*) AS count 
        FROM products 
        GROUP BY category 
        ORDER BY count DESC
      `);

      return res.json({
        success: true,
        source: 'MySQL',
        metrics: {
          totalUsers: Number(userCounts[0]?.totalUsers || 0),
          totalFarmers: Number(userCounts[0]?.totalFarmers || 0),
          totalBuyers: Number(userCounts[0]?.totalBuyers || 0),
          totalDeliveryPartners: Number(userCounts[0]?.totalDeliveryPartners || 0),
          totalAdmins: Number(userCounts[0]?.totalAdmins || 0),

          totalProducts: Number(productCounts[0]?.totalProducts || 0),
          inStockProducts: Number(productCounts[0]?.inStockProducts || 0),
          outOfStockProducts: Number(productCounts[0]?.outOfStockProducts || 0),
          organicProducts: Number(productCounts[0]?.organicProducts || 0),
          nonOrganicProducts: Number(productCounts[0]?.nonOrganicProducts || 0),

          totalOrders: Number(orderCounts[0]?.totalOrders || 0),
          pendingOrders: Number(orderCounts[0]?.pendingOrders || 0),
          activeOrders: Number(orderCounts[0]?.activeOrders || 0),
          deliveredOrders: Number(orderCounts[0]?.deliveredOrders || 0),
          cancelledOrders: Number(orderCounts[0]?.cancelledOrders || 0),
          totalRevenue: parseFloat(orderCounts[0]?.totalRevenue || 0),
        },
        statistics: {
          ordersByStatus: ordersByStatus || [],
          usersByRole: usersByRole || [],
          productsByCategory: productsByCategory || [],
        },
      });
    }

    // Resilient fallback to memory store if MySQL connection is ever interrupted
    const allUsers = dbStore.users || [];
    const allProducts = await dbStore.getAllProducts();
    const allOrders = await dbStore.getAllOrders();

    const metrics = {
      totalUsers: allUsers.length,
      totalFarmers: allUsers.filter((u) => u.role === 'farmer').length,
      totalBuyers: allUsers.filter((u) => u.role === 'buyer').length,
      totalDeliveryPartners: allUsers.filter((u) => u.role === 'delivery').length,
      totalAdmins: allUsers.filter((u) => u.role === 'admin').length,

      totalProducts: allProducts.length,
      inStockProducts: allProducts.filter((p) => Number(p.stock) > 0).length,
      outOfStockProducts: allProducts.filter((p) => Number(p.stock) <= 0).length,
      organicProducts: allProducts.filter((p) => Boolean(p.is_organic ?? p.isOrganic)).length,
      nonOrganicProducts: allProducts.filter((p) => !Boolean(p.is_organic ?? p.isOrganic)).length,

      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter((o) => ['Pending', 'Placed', 'Processing'].includes(o.status)).length,
      activeOrders: allOrders.filter((o) => ['Accepted', 'Ready for Pickup', 'Picked Up', 'Out for Delivery'].includes(o.status)).length,
      deliveredOrders: allOrders.filter((o) => o.status === 'Delivered').length,
      cancelledOrders: allOrders.filter((o) => o.status === 'Cancelled').length,
      totalRevenue: allOrders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
    };

    res.json({
      success: true,
      source: 'MemoryStore',
      metrics,
      statistics: {
        ordersByStatus: [],
        usersByRole: [],
        productsByCategory: [],
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin dashboard overview: ' + error.message,
    });
  }
};

// @desc    Get Registered Users with Filters & Search (Passwords Excluded)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAdminUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    if (getIsMySQLConnected()) {
      const pool = getMySQLPool();
      let query = `
        SELECT 
          id, _id, name, email, role, farmName, farmLocation, address, city, district, 
          state, pincode, phone, verified, avatar, experienceYears, hectares, vehicleType, 
          serviceArea, region, rating, completedDeliveries, created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      const params = [];

      if (role && role !== 'all') {
        query += ' AND role = ?';
        params.push(role);
      }

      if (search && search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? OR LOWER(city) LIKE ? OR LOWER(farmName) LIKE ?)';
        params.push(term, term, term, term, term);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.query(query, params);
      return res.json({
        success: true,
        count: rows.length,
        users: rows,
      });
    }

    let users = dbStore.users.map((u) => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.phone?.includes(s) ||
          u.city?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving users: ' + error.message,
    });
  }
};

// @desc    Get All Products with Filters & Search for Admin
// @route   GET /api/admin/products
// @access  Private (Admin only)
export const getAdminProducts = async (req, res) => {
  try {
    const { category, search, isOrganic } = req.query;

    if (getIsMySQLConnected()) {
      const pool = getMySQLPool();
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
      }

      if (isOrganic === 'true' || isOrganic === '1') {
        query += ' AND (is_organic = 1 OR isOrganic = 1)';
      } else if (isOrganic === 'false' || isOrganic === '0') {
        query += ' AND (is_organic = 0 OR is_organic IS NULL) AND (isOrganic = 0 OR isOrganic IS NULL)';
      }

      if (search && search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        query += ' AND (LOWER(name) LIKE ? OR LOWER(farmerName) LIKE ? OR LOWER(farmLocation) LIKE ? OR LOWER(category) LIKE ?)';
        params.push(term, term, term, term);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.query(query, params);
      const mapped = rows.map((r) => {
        const org = Boolean(r.is_organic ?? r.isOrganic);
        return { ...r, isOrganic: org, is_organic: org };
      });

      return res.json({
        success: true,
        count: mapped.length,
        products: mapped,
      });
    }

    let products = await dbStore.getAllProducts();

    if (category && category !== 'All') {
      products = products.filter((p) => p.category === category);
    }

    if (isOrganic === 'true' || isOrganic === '1') {
      products = products.filter((p) => Boolean(p.is_organic ?? p.isOrganic));
    } else if (isOrganic === 'false' || isOrganic === '0') {
      products = products.filter((p) => !Boolean(p.is_organic ?? p.isOrganic));
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.farmerName?.toLowerCase().includes(s) ||
          p.farmLocation?.toLowerCase().includes(s) ||
          p.category?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving products: ' + error.message,
    });
  }
};

// @desc    Get All Orders for Admin with Filters & Search
// @route   GET /api/admin/orders
// @access  Private (Admin only)
export const getAdminOrders = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (getIsMySQLConnected()) {
      const pool = getMySQLPool();
      let query = 'SELECT * FROM orders WHERE 1=1';
      const params = [];

      if (status && status !== 'All') {
        query += ' AND status = ?';
        params.push(status);
      }

      if (search && search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        query += ' AND (LOWER(id) LIKE ? OR LOWER(buyerName) LIKE ? OR LOWER(farmerName) LIKE ? OR LOWER(deliveryCity) LIKE ?)';
        params.push(term, term, term, term);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.query(query, params);
      const orders = rows.map((r) => ({
        ...r,
        items: safeParseJSON(r.items, []),
        assignedDeliveryPartner: safeParseJSON(r.assignedDeliveryPartner, null),
        buyerLocation: safeParseJSON(r.buyerLocation, null),
        timestamps: safeParseJSON(r.timestamps, null),
        trackingSteps: safeParseJSON(r.trackingSteps, []),
        total: parseFloat(r.total) || 0,
        subtotal: parseFloat(r.subtotal) || 0,
        deliveryFee: parseFloat(r.deliveryFee) || 0,
      }));

      return res.json({
        success: true,
        count: orders.length,
        orders,
      });
    }

    let orders = await dbStore.getAllOrders();

    if (status && status !== 'All') {
      orders = orders.filter((o) => o.status === status);
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id?.toLowerCase().includes(s) ||
          o.buyerName?.toLowerCase().includes(s) ||
          o.farmerName?.toLowerCase().includes(s) ||
          o.deliveryCity?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving orders: ' + error.message,
    });
  }
};

// @desc    Get Real System Activity (Recently registered users, products, orders)
// @route   GET /api/admin/recent-activity
// @access  Private (Admin only)
export const getAdminRecentActivity = async (req, res) => {
  try {
    if (getIsMySQLConnected()) {
      const pool = getMySQLPool();

      // 1. Recently registered users
      const [recentUsers] = await pool.query(`
        SELECT id, name, email, role, city, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 6
      `);

      // 2. Recently added products
      const [recentProducts] = await pool.query(`
        SELECT id, name, category, price, unit, stock, farmerName, is_organic, isOrganic, created_at 
        FROM products 
        ORDER BY created_at DESC 
        LIMIT 6
      `);

      // 3. Recently placed orders
      const [recentOrders] = await pool.query(`
        SELECT id, buyerName, farmerName, total, status, created_at 
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 6
      `);

      // 4. Recently completed deliveries
      const [recentDeliveries] = await pool.query(`
        SELECT id, buyerName, farmerName, total, status, updated_at 
        FROM orders 
        WHERE status = 'Delivered' 
        ORDER BY updated_at DESC 
        LIMIT 6
      `);

      return res.json({
        success: true,
        recentUsers: recentUsers || [],
        recentProducts: (recentProducts || []).map((p) => ({
          ...p,
          isOrganic: Boolean(p.is_organic ?? p.isOrganic),
          is_organic: Boolean(p.is_organic ?? p.isOrganic),
        })),
        recentOrders: recentOrders || [],
        recentDeliveries: recentDeliveries || [],
      });
    }

    // Memory store fallback
    const allUsers = dbStore.users || [];
    const allProducts = await dbStore.getAllProducts();
    const allOrders = await dbStore.getAllOrders();

    res.json({
      success: true,
      recentUsers: allUsers.slice(0, 6).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        city: u.city,
        created_at: u.createdAt || u.created_at,
      })),
      recentProducts: allProducts.slice(0, 6),
      recentOrders: allOrders.slice(0, 6),
      recentDeliveries: allOrders.filter((o) => o.status === 'Delivered').slice(0, 6),
    });
  } catch (error) {
    console.error('Admin recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving recent activity: ' + error.message,
    });
  }
};

// @desc    Admin Delete Produce Item from Database
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
export const deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await dbStore.deleteProduct(id);
    res.json({
      success: true,
      message: `Product ${id} deleted successfully by administrator.`,
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product: ' + error.message,
    });
  }
};

// @desc    Admin Delete User from Database (Except self)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id || req.user._id;

    if (String(id) === String(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Security Violation: Administrators cannot delete their own active account.',
      });
    }

    if (getIsMySQLConnected()) {
      const pool = getMySQLPool();
      await pool.query('DELETE FROM users WHERE id = ? OR _id = ?', [String(id), String(id)]);
    }

    dbStore.users = (dbStore.users || []).filter((u) => u.id !== id && u._id !== id);

    res.json({
      success: true,
      message: `User ${id} removed successfully from the portal.`,
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user: ' + error.message,
    });
  }
};

// @desc    Admin Update Order Status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin only)
export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Accepted', 'Ready for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (getIsMySQLConnected()) {
      const pool = getMySQLPool();
      await pool.query('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR _id = ?', [status, String(id), String(id)]);
    }

    await dbStore.updateOrderStatus(id, status);

    res.json({
      success: true,
      message: `Order ${id} status updated to ${status}.`,
      status,
    });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status: ' + error.message,
    });
  }
};
