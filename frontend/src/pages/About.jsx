import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Award, ShieldCheck, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16 pb-16 bg-[#fcfbf7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 transition-colors duration-200">
      {/* Header Banner */}
      <section className="bg-farm-900 dark:bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center rounded-b-3xl relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-lime-300 text-xs font-bold uppercase tracking-wider bg-white/10 px-3.5 py-1 rounded-full">
            Our Mission & Roots
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold">
            Empowering Farmers, Nourishing Families
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            We started with one conviction: hardworking growers deserve fair, dignified income, and urban households deserve truly fresh, chemical-free food directly from the ground.
          </p>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-farm-600 dark:text-farm-400 uppercase tracking-widest">Why FarmStore?</span>
            <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white">
              Transforming the Agriculture Supply Chain
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
              In conventional food retail, produce passes through 5 to 7 wholesale aggregators, spending up to a week in transit and cold stores while losing 40% of its vital nutrition. Meanwhile, the actual farmer receives less than 20% of what consumers pay.
            </p>
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
              FarmStore solves this crisis by pairing modern web logistics with regenerative regional agriculture. Our farmers set their prices, harvest on demand when you order, and retain up to 85% of each sale.
            </p>

            <div className="pt-2">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-farm-700 hover:bg-farm-800 text-white text-xs font-bold transition shadow-md"
              >
                <span>Explore Farmer Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800">
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
                alt="Farmer holding fresh harvest"
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-lime-400 text-farm-950 p-5 rounded-2xl shadow-xl max-w-xs hidden sm:block">
              <div className="text-2xl font-bold font-display">85% Revenue</div>
              <div className="text-xs font-semibold">Directly credited to verified growers within 24h of delivery.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-farm-700 dark:text-farm-400">450+</div>
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Partner Farms</div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Across South India</p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-farm-700 dark:text-farm-400">12,500+</div>
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Urban Families</div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Subscribed for fresh box</p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-farm-700 dark:text-farm-400">100%</div>
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Pesticide Free</div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Regularly tested soil & water</p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-center space-y-1 shadow-xs">
            <div className="text-3xl sm:text-4xl font-display font-extrabold text-farm-700 dark:text-farm-400">18 Hrs</div>
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Harvest to Kitchen</div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Cold-chain delivery speed</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-farm-600 dark:text-farm-400 uppercase tracking-widest">Integrity First</span>
          <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white">
            Our Guiding Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-farm-50/70 dark:bg-stone-900 p-6 rounded-3xl border border-farm-100 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-farm-700 dark:bg-farm-600 text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">Regenerative Soil</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              We encourage organic composting, bio-fertilizers, crop rotation, and traditional seed preservation to protect biodiversity.
            </p>
          </div>

          <div className="bg-amber-50/70 dark:bg-stone-900 p-6 rounded-3xl border border-amber-100 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">Transparent Pricing</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Full visibility on farmer cost breakdowns, packaging, and logistics. No hidden margins or extortionate commissions.
            </p>
          </div>

          <div className="bg-emerald-50/70 dark:bg-stone-900 p-6 rounded-3xl border border-emerald-100 dark:border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">Lab-Tested Purity</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Random batch testing for heavy metals and chemical residues ensures every leaf, root, and fruit is completely safe for your kids.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
