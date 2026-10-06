import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    subCategory: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isOrganic: {
      type: Boolean,
      default: true,
    },
    harvestDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    farmerId: {
      type: String,
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    farmLocation: {
      type: String,
      default: 'Tamil Nadu',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'Coimbatore',
    },
    district: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      default: 11.0168,
    },
    longitude: {
      type: Number,
      default: 76.9558,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
