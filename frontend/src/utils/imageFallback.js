/**
 * Category-based Image Fallback Utility
 * Ensures that every product always displays a valid, high-quality authentic raw product image matching its category.
 */

export const CATEGORY_FALLBACKS = {
  'Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop&q=80',
  'Grains & Cereals': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
  'Pulses & Legumes': 'https://images.unsplash.com/photo-1585996746979-994f71a7674a?w=800&auto=format&fit=crop&q=80',
  'Dairy Products': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
  'Herbs & Spices': 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
  'Default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
};

export const getCategoryFallbackImage = (category) => {
  return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['Default'];
};

export const handleImageError = (e, category) => {
  const fallback = getCategoryFallbackImage(category);
  if (e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
};
