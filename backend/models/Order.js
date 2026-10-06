import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, default: 'kg' },
    farmer: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    farmerId: { type: String, required: true },
    farmerName: { type: String, default: 'Organic Farm' },
    farmLocation: { type: String, default: 'Tamil Nadu' },
    image: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  { _id: false }
);

const trackingStepSchema = new mongoose.Schema(
  {
    key: String,
    title: String,
    desc: String,
    done: Boolean,
    current: Boolean,
    time: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    buyer: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    buyerId: {
      type: String,
      required: true,
      index: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
      default: '',
    },
    deliveryCity: {
      type: String,
      default: 'Coimbatore',
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    buyerLocation: {
      address: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    farmer: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    farmerName: {
      type: String,
      default: '',
    },
    farmLocation: {
      type: String,
      default: '',
    },
    farmerLocation: {
      address: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    farmDistanceKm: {
      type: Number,
      default: 0,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: 'UPI / QR Payment',
    },
    deliveryEarnings: {
      type: Number,
      default: 50,
    },
    paymentStatus: {
      type: String,
      default: 'Paid',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Placed',
        'Accepted',
        'Processing',
        'Ready for Pickup',
        'Picked Up',
        'Out for Delivery',
        'Delivered',
        'Rejected',
      ],
      default: 'Pending',
    },
    estimatedDelivery: {
      type: String,
      default: 'Tomorrow Morning (7:00 AM - 10:00 AM)',
    },
    assignedDeliveryPartner: {
      id: String,
      email: String,
      name: String,
      phone: String,
      vehicleType: String,
      serviceArea: String,
      region: String,
      city: String,
    },
    timestamps: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ placed: new Date().toLocaleTimeString() }),
    },
    trackingSteps: [trackingStepSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
