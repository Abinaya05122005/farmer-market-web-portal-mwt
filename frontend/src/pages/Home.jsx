import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Leaf, 
  Clock, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products, setSelectedCategory } = useProducts();
  const { t } = useLanguage();

  const featuredProduce = products.slice(0, 4);

  const categories = [
    {
      name: t('cat.vegetables'),
      filterKey: 'Vegetables',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      count: '10+ Fresh Items',
      desc: 'Crisp, nutrient-dense local vegetables'
    },
    {
      name: t('cat.fruits'),
      filterKey: 'Fruits',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
      count: '10+ Seasonal Picks',
      desc: 'Tree-ripened, sun-kissed regional fruits'
    },
    {
      name: t('cat.grains') || 'Grains & Cereals',
      filterKey: 'Grains & Cereals',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      count: '10+ Native Millets',
      desc: 'Ancient grains, aged Ponni rice & whole wheats'
    },
    {
      name: t('cat.pulses') || 'Pulses & Legumes',
      filterKey: 'Pulses & Legumes',
      image: '/images/categories/pulses-legumes.png',
      count: '10+ Protein Staples',
      desc: 'Zero-polish desi dals, grams & heirloom beans'
    },
    {
      name: t('cat.dairy') || 'Dairy Products',
      filterKey: 'Dairy Products',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
      count: '10+ Farmstead Delights',
      desc: 'Pure A2 milk, clay-pot curd, paneer & bilona ghee'
    },
    {
      name: t('cat.spices') || 'Herbs & Spices',
      filterKey: 'Herbs & Spices',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      count: '10+ High Potency',
      desc: 'Fresh herbs, whole Salem turmeric & Nilgiris spices'
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-farm-50/70 dark:from-farm-950/40 via-stone-50/40 dark:via-stone-900/30 to-white dark:to-stone-950 pt-8 pb-16 sm:py-20 border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('home.heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight leading-[1.12]">
                {t('home.heroTitle1')} <br />
                <span className="text-farm-700 dark:text-farm-400 italic">{t('home.heroTitle2')}</span>
              </h1>

              <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed max-w-lg">
                {t('home.heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/marketplace"
                  className="px-7 py-4 rounded-2xl bg-farm-700 hover:bg-farm-800 dark:bg-farm-600 dark:hover:bg-farm-700 text-white font-bold text-sm sm:text-base transition duration-200 flex items-center gap-2.5 shadow-xl shadow-farm-800/20 active:scale-95"
                >
                  <span>{t('home.shopProduce')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/farmer/register"
                  className="px-6 py-4 rounded-2xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 font-bold text-sm sm:text-base transition duration-200 border border-stone-200 dark:border-stone-700 shadow-xs"
                >
                  {t('home.sellHarvest')}
                </Link>
              </div>

              {/* Trust Badges under CTA */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{t('home.organicCertified')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{t('home.localGrown')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-farm-600 dark:text-farm-400 shrink-0" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{t('home.harvestFresh')}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-stone-100 dark:bg-stone-800 aspect-[4/3] relative">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80"
                    alt="Fresh organic farm harvest display"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-lime-300 text-xs font-bold uppercase tracking-wider">
                      Morning Harvest Dispatch
                    </span>
                    <h3 className="text-white text-xl font-bold font-display">
                      Coimbatore Organic Co-operative
                    </h3>
                    <p className="text-stone-200 text-xs mt-1">
                      Over 85 active local farms harvest and pack directly for you.
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-extrabold text-lg">
                    🌱
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-white">{t('home.zeroMiddlemen')}</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{t('home.farmersKeep')}</div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl py-2.5 px-4 shadow-xl border border-stone-100 dark:border-stone-800 hidden sm:flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-100">{t('home.familiesServed')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-farm-600 dark:text-farm-400 tracking-wider uppercase">Handpicked Catalog</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white">
            {t('home.categoriesTitle')}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t('home.categoriesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.filterKey}
              to={`/marketplace?category=${encodeURIComponent(cat.filterKey)}`}
              onClick={() => setSelectedCategory(cat.filterKey)}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900"
            >
              <div className="h-56 w-full overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold text-lime-300 uppercase tracking-wider block mb-1">
                    {cat.count}
                  </span>
                  <h3 className="font-display font-bold text-xl leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-stone-200 line-clamp-1 mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CUSTOMER FAVORITES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-farm-600 dark:text-farm-400 tracking-wider uppercase">This Morning's Harvest</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white mt-1">
              {t('home.favoritesTitle')}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {t('home.favoritesSubtitle')}
            </p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-bold text-farm-700 dark:text-farm-400 hover:text-farm-800 bg-farm-50 dark:bg-farm-950/50 hover:bg-farm-100 px-4 py-2.5 rounded-xl transition"
          >
            <span>{t('home.viewAll')} ({products.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProduce.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-farm-800 dark:bg-farm-700 hover:bg-farm-900 text-white text-sm font-bold shadow-md transition"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. FROM OUR FARMS TO YOU (3-step) */}
      <section className="bg-farm-900 dark:bg-farm-950 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">{t('home.processBadge')}</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            {t('home.processTitle')}
          </h2>
          <p className="text-stone-300 text-sm">
            {t('home.processSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="text-center space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-16 h-16 rounded-full bg-lime-400 text-farm-950 text-2xl font-display font-bold flex items-center justify-center mx-auto shadow-lg">
              1
            </div>
            <h3 className="text-xl font-bold font-display text-white">{t('home.step1Title')}</h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {t('home.step1Desc')}
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-16 h-16 rounded-full bg-lime-400 text-farm-950 text-2xl font-display font-bold flex items-center justify-center mx-auto shadow-lg">
              2
            </div>
            <h3 className="text-xl font-bold font-display text-white">{t('home.step2Title')}</h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {t('home.step2Desc')}
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-16 h-16 rounded-full bg-lime-400 text-farm-950 text-2xl font-display font-bold flex items-center justify-center mx-auto shadow-lg">
              3
            </div>
            <h3 className="text-xl font-bold font-display text-white">{t('home.step3Title')}</h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {t('home.step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. THE FRESH HARVEST PROMISE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-farm-600 dark:text-farm-400 tracking-wider uppercase">Our Principles</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white">
            {t('home.promiseTitle')}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t('home.promiseSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-emerald-50/80 dark:bg-stone-900 p-6 rounded-3xl border border-emerald-100 dark:border-stone-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">{t('home.promise1Title')}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {t('home.promise1Desc')}
            </p>
          </div>

          <div className="bg-amber-50/80 dark:bg-stone-900 p-6 rounded-3xl border border-amber-100 dark:border-stone-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">{t('home.promise2Title')}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {t('home.promise2Desc')}
            </p>
          </div>

          <div className="bg-sky-50/80 dark:bg-stone-900 p-6 rounded-3xl border border-sky-100 dark:border-stone-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">{t('home.promise3Title')}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {t('home.promise3Desc')}
            </p>
          </div>

          <div className="bg-lime-50/80 dark:bg-stone-900 p-6 rounded-3xl border border-lime-200 dark:border-stone-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">{t('home.promise4Title')}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {t('home.promise4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 6. WHAT OUR CUSTOMERS SAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-farm-600 dark:text-farm-400 tracking-wider uppercase">Verified Reviews</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white">
            {t('home.testimonialsTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4">
            <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed italic">
              "The quality of produce is outstanding! Everything arrives crisp, cool, and lasts so much longer than supermarkets. My family loves the sweet carrots and tomatoes."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
                alt="Sarah Mitchell"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-white">Sarah Mitchell</h4>
                <div className="flex text-amber-400 text-xs">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4">
            <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed italic">
              "FarmStore has completely changed how I shop for groceries. Supporting local farmers while getting the freshest vegetables delivered is a win-win."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"
                alt="Michael Chen"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-white">Michael Chen</h4>
                <div className="flex text-amber-400 text-xs">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4">
            <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed italic">
              "As someone who cares about organic food, FarmStore is a dream come true. The convenience and quality are unmatched. Highly recommend!"
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Emma Rodriguez"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-white">Emma Rodriguez</h4>
                <div className="flex text-amber-400 text-xs">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
