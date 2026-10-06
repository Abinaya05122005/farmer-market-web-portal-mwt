import { dbStore } from '../store/dataStore.js';
import { getAllMarketRates, syncMarketPrices } from '../services/marketPriceService.js';

// @desc    Get all marketplace products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const allProducts = await dbStore.getAllProducts();
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    // If pagination query parameters are provided, return paginated results
    if (page && limit && page > 0 && limit > 0) {
      const startIndex = (page - 1) * limit;
      const paginated = allProducts.slice(startIndex, startIndex + limit);
      return res.json({
        success: true,
        count: paginated.length,
        total: allProducts.length,
        pagination: {
          currentPage: page,
          limit,
          totalPages: Math.ceil(allProducts.length / limit),
          totalProducts: allProducts.length,
          hasNextPage: startIndex + limit < allProducts.length,
          hasPrevPage: page > 1,
        },
        products: paginated,
      });
    }

    res.json({
      success: true,
      count: allProducts.length,
      total: allProducts.length,
      products: allProducts,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products: ' + error.message,
    });
  }
};

// @desc    Get products listed by the logged-in farmer
// @route   GET /api/products/farmer
// @access  Private (Farmer only)
export const getMyProducts = async (req, res) => {
  try {
    const farmerId = req.user.id || req.user._id;
    const products = await dbStore.getProductsByFarmer(farmerId);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching farmer crops:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your crop listings: ' + error.message,
    });
  }
};

// @desc    Add a new produce item
// @route   POST /api/products
// @access  Private (Farmer only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      subCategory = '',
      price,
      stock = 100,
      unit = 'kg',
      description = '',
      image = '',
      isOrganic,
      is_organic,
      featured = false,
      badge = '',
      city,
      district,
      latitude,
      longitude,
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide produce name, category, and price.',
      });
    }

    const organicVal = is_organic !== undefined 
      ? Boolean(is_organic) 
      : (isOrganic !== undefined ? Boolean(isOrganic) : true);

    const farmerId = req.user.id || req.user._id;
    const farmerName = req.user.farmName || req.user.name;
    const farmLocation = req.user.farmLocation || (city ? `${city}, Tamil Nadu` : 'Tamil Nadu');

    const newProduct = await dbStore.createProduct({
      name: name.trim(),
      category,
      subCategory,
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 0,
      unit,
      description,
      image,
      isOrganic: organicVal,
      is_organic: organicVal,
      featured: Boolean(featured),
      badge,
      farmer: req.user._id || req.user.id,
      farmerId: farmerId,
      farmerName: farmerName,
      farmLocation: farmLocation,
      city: city || req.user.city || 'Coimbatore',
      district: district || req.user.district || '',
      latitude: latitude !== undefined ? Number(latitude) : req.user.latitude || 11.0168,
      longitude: longitude !== undefined ? Number(longitude) : req.user.longitude || 76.9558,
      rating: 5.0,
      reviewsCount: 1,
      harvestDate: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      message: 'Produce listed successfully in the Marketplace!',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error listing produce: ' + error.message,
    });
  }
};

// @desc    Update a crop listing
// @route   PUT /api/products/:id
// @access  Private (Farmer only)
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const farmerId = req.user.id || req.user._id;
    const userRole = req.user.role;

    const existing = (await dbStore.getAllProducts()).find(
      (p) => p.id === productId || p._id === productId || String(p._id) === String(productId)
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Produce item not found.',
      });
    }

    if (existing.farmerId !== farmerId && existing.farmer !== farmerId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify crops from another farm.',
      });
    }

    const updatePayload = { ...req.body };
    if (updatePayload.is_organic !== undefined) {
      updatePayload.isOrganic = Boolean(updatePayload.is_organic);
      updatePayload.is_organic = Boolean(updatePayload.is_organic);
    } else if (updatePayload.isOrganic !== undefined) {
      updatePayload.is_organic = Boolean(updatePayload.isOrganic);
      updatePayload.isOrganic = Boolean(updatePayload.isOrganic);
    }

    const updated = await dbStore.updateProduct(productId, updatePayload);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating produce: ' + error.message,
    });
  }
};

// @desc    Delete a crop listing
// @route   DELETE /api/products/:id
// @access  Private (Farmer or Admin)
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const farmerId = req.user.id || req.user._id;
    const userRole = req.user.role;

    const existing = (await dbStore.getAllProducts()).find(
      (p) => p.id === productId || p._id === productId || String(p._id) === String(productId)
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Produce item not found.',
      });
    }

    if (existing.farmerId !== farmerId && existing.farmer !== farmerId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete crops from another farm.',
      });
    }

    await dbStore.deleteProduct(productId);

    res.json({
      success: true,
      message: 'Produce listing deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting produce: ' + error.message,
    });
  }
};

// @desc    Get current AGMARKNET / eNAM market rates
// @route   GET /api/products/market-rates
// @access  Public
export const getMarketRates = async (req, res) => {
  try {
    const rates = getAllMarketRates();
    res.json({
      success: true,
      count: Object.keys(rates).length,
      source: 'AGMARKNET & eNAM Tamil Nadu APMC Mandi Benchmarks',
      rates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger sync of current market prices into database
// @route   POST /api/products/sync-market-prices
// @access  Public
export const syncMarketPricesHandler = async (req, res) => {
  try {
    const syncResult = await syncMarketPrices();
    res.json({
      success: true,
      message: 'Market prices synchronized successfully with AGMARKNET Mandi benchmarks.',
      syncResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record product view for logged-in user
// @route   POST /api/products/:id/view
// @access  Private
export const recordProductViewHandler = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    // Feature requirement: Strictly for Buyer interactions (or admin inspection)
    if (userRole !== 'buyer' && userRole !== 'admin') {
      return res.json({
        success: true,
        message: 'View acknowledged (recorded for buyer profiles only).',
      });
    }

    const recorded = await dbStore.recordProductView(userId, productId);
    if (!recorded) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or invalid product ID.',
      });
    }

    res.json({
      success: true,
      message: 'Product view recorded successfully.',
    });
  } catch (error) {
    console.error('Error recording product view:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording product view: ' + error.message,
    });
  }
};

// @desc    Get recently viewed products for logged-in user
// @route   GET /api/products/recently-viewed
// @access  Private
export const getRecentlyViewedHandler = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    // Non-buyers (e.g. standalone farmer role) do not receive buyer recently viewed recommendations
    if (userRole === 'farmer') {
      return res.json({
        success: true,
        count: 0,
        products: [],
      });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
    const products = await dbStore.getRecentlyViewedProducts(userId, limit);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching recently viewed products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recently viewed products: ' + error.message,
    });
  }
};
