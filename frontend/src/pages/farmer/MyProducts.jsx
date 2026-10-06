import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Check, ArrowLeft, Layers } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { handleImageError, getCategoryFallbackImage } from '../../utils/imageFallback';

export default function MyProducts() {
  const { products, updateProduct, deleteProduct, toggleStockStatus } = useProducts();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editIsOrganic, setEditIsOrganic] = useState(true);

  // Display only products created by the currently logged-in Farmer
  const myCrops = products.filter(
    (p) => p.farmerId === currentUser?.id || p.farmerName === currentUser?.name || (currentUser?.farmName && p.farmerName === currentUser?.farmName)
  );

  const cropsToShow = myCrops;

  const startEdit = (crop) => {
    setEditingId(crop.id);
    setEditPrice(crop.price);
    setEditStock(crop.stock);
    setEditIsOrganic(Boolean(crop.is_organic !== undefined ? crop.is_organic : crop.isOrganic));
  };

  const saveEdit = (id) => {
    updateProduct(id, {
      price: parseFloat(editPrice),
      stock: parseInt(editStock, 10),
      isOrganic: Boolean(editIsOrganic),
      is_organic: Boolean(editIsOrganic),
    });
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/dashboard"
            className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-stone-600 dark:text-stone-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white">
              {t('nav.manageCrops')}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {currentUser?.farmName || currentUser?.name || 'Green Valley Organics'} • Active Crop Listings
            </p>
          </div>
        </div>

        <Link
          to="/farmer/add-product"
          className="px-5 py-2.5 bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Harvested Crop</span>
        </Link>
      </div>

      {/* Crops Table Container */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-farm-600 dark:text-farm-400" />
            <h3 className="font-bold text-stone-900 dark:text-white text-base">
              My Listed Farm Produce
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-400 dark:text-stone-500">
            {cropsToShow.length} {cropsToShow.length === 1 ? 'Crop Listed' : 'Crops Listed'}
          </span>
        </div>

        {cropsToShow.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 bg-farm-50 dark:bg-stone-800 text-farm-700 dark:text-farm-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🌱
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">No Harvested Crops Listed Yet</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              You haven't listed any crops in the market yet. Start listing your fresh produce to receive customer orders!
            </p>
            <Link
              to="/farmer/add-product"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-farm-700 hover:bg-farm-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Harvested Crop</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Produce Item</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price / Unit</th>
                  <th className="py-3.5 px-6">Stock Level</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {cropsToShow.map((crop) => {
                  const isEditing = editingId === crop.id;
                  return (
                    <tr key={crop.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={crop.image || getCategoryFallbackImage(crop.category)}
                            alt={crop.name}
                            onError={(e) => handleImageError(e, crop.category)}
                            className="w-12 h-12 rounded-2xl object-cover bg-stone-100 dark:bg-stone-800"
                          />
                          <div>
                            <div className="font-bold text-stone-900 dark:text-white text-sm">{crop.name}</div>
                            {isEditing ? (
                              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer mt-1">
                                <input
                                  type="checkbox"
                                  checked={editIsOrganic}
                                  onChange={(e) => setEditIsOrganic(e.target.checked)}
                                  className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                                />
                                <span className={editIsOrganic ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500'}>
                                  {editIsOrganic ? '🌱 Organic' : 'Non-Organic'}
                                </span>
                              </label>
                            ) : (
                              <div className="text-stone-400 dark:text-stone-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                                {Boolean(crop.is_organic !== undefined ? crop.is_organic : crop.isOrganic) ? (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">🌱 Organic</span>
                                ) : (
                                  <span className="text-stone-600 dark:text-stone-400 font-medium bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">Non-Organic</span>
                                )}
                                <span>• Picked: {crop.harvestDate || 'Today'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                          {crop.category}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-stone-500">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 px-2 py-1 bg-stone-50 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-xs font-bold"
                            />
                            <span className="text-stone-400">/{crop.unit}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-stone-900 dark:text-white text-sm">
                            ₹{Number(crop.price || 0).toFixed(2)} <span className="text-stone-400 text-xs font-normal">/{crop.unit}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-20 px-2 py-1 bg-stone-50 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg text-xs font-bold"
                          />
                        ) : (
                          <span className="font-bold text-stone-700 dark:text-stone-300">
                            {crop.stock} {crop.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStockStatus(crop.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition cursor-pointer ${
                            crop.stock > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-rose-100'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 hover:bg-emerald-100'
                          }`}
                          title="Click to toggle stock status"
                        >
                          {crop.stock > 0 ? '● In Stock' : '○ Out of Stock'}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <button
                              onClick={() => saveEdit(crop.id)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                              title="Save Changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => startEdit(crop)}
                              className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                              title="Edit Price & Stock"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => deleteProduct(crop.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                            title="Remove Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
