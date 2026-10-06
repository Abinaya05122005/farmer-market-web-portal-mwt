import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Header & Navigation
    'nav.announcement': '🌱 100% Organic Direct-to-Doorstep • Use code FARM20 for 20% OFF',
    'nav.helpline': 'Helpline',
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.signIn': 'Sign In',
    'nav.farmerPortal': 'Farmer Portal',
    'nav.adminPanel': 'Admin Panel',
    'nav.myOrders': 'My Orders',
    'nav.cart': 'Cart',
    'nav.signOut': 'Sign Out',
    'nav.farmDashboard': 'Farm Dashboard',
    'nav.listProduce': 'List New Produce',
    'nav.manageCrops': 'Manage My Crops',
    'nav.customerOrders': 'Customer Orders',
    'nav.deliveryPortal': 'Delivery Portal',
    'nav.deliveryDashboard': 'Delivery Dashboard',
    'nav.deliveryPartner': 'Delivery Partner',
    'nav.demoRole': 'Account Role',
    'nav.switchAccount': 'Switch Account',
    'nav.theme': 'Theme',
    'nav.themeLight': 'Light Mode',
    'nav.themeDark': 'Dark Mode',
    'nav.themeSystem': 'System Default',
    'nav.language': 'Language',

    // Hero & Home
    'home.heroBadge': '100% Direct From Regenerative Farmers',
    'home.heroTitle1': 'Fresh From Farm',
    'home.heroTitle2': 'to Your Table',
    'home.heroSubtitle': 'Organic produce delivered daily. Experience the natural sweetness, crunch, and vitality of crops harvested just hours ago by certified local growers.',
    'home.shopProduce': 'Shop Fresh Produce',
    'home.sellHarvest': 'Sell Your Harvest',
    'home.organicCertified': 'Organic Certified',
    'home.localGrown': 'Local Grown',
    'home.harvestFresh': 'Harvest Fresh',
    'home.zeroMiddlemen': 'Zero Middlemen',
    'home.farmersKeep': 'Farmers keep 85% of revenue',
    'home.familiesServed': '12,000+ Families Served',

    // Categories
    'home.categoriesTitle': 'Shop By Category',
    'home.categoriesSubtitle': 'Select from pesticide-free, sustainably cultivated farm fresh produce.',
    'cat.all': 'All Items',
    'cat.vegetables': 'Vegetables',
    'cat.fruits': 'Fruits',
    'cat.grains': 'Grains & Cereals',
    'cat.pulses': 'Pulses & Legumes',
    'cat.dairy': 'Dairy Products',
    'cat.spices': 'Herbs & Spices',
    'cat.herbs': 'Herbs & Greens',
    'cat.bundles': 'Farm Bundles',
    'nav.wishlist': 'Wishlist',

    // Process & Promise
    'home.processBadge': 'Our Seamless Process',
    'home.processTitle': 'From Our Farms to You',
    'home.processSubtitle': 'We bypass wholesale warehouses to bring crops directly from the soil into your kitchen within 24 hours.',
    'home.step1Title': 'Select Fresh Produce',
    'home.step1Desc': 'Browse our selection of organic fruits, crisp veggies, and family bundles directly listed by regional farmers.',
    'home.step2Title': 'We Harvest Daily',
    'home.step2Desc': 'Orders are picked directly from the soil early in the morning so nutrients, crunch, and aroma stay at their peak.',
    'home.step3Title': 'Delivered to Your Door',
    'home.step3Desc': 'Fast, cold-chain eco logistics bring your produce directly to your home with full tracking and zero wastage.',

    'home.promiseTitle': 'The Fresh Harvest Promise',
    'home.promiseSubtitle': 'We are committed to quality from soil to your doorstep.',
    'home.promise1Title': '100% Organic',
    'home.promise1Desc': 'No pesticides or harmful chemicals. Just pure, natural goodness verified by soil testing.',
    'home.promise2Title': 'Farm Fresh Daily',
    'home.promise2Desc': 'Harvested every morning to ensure maximum freshness, crispness, and full vitamin retention.',
    'home.promise3Title': 'Fast, Free Delivery',
    'home.promise3Desc': 'Get your fresh vegetables delivered to your home in hours, not days. Free over ₹500.',
    'home.promise4Title': 'Sustainable Practices',
    'home.promise4Desc': 'We care for our planet with eco-friendly biodegradable packaging and fair-trade farmer pay.',

    'home.favoritesTitle': 'Customer Favorites',
    'home.favoritesSubtitle': 'Our most-loved certified organic produce this week.',
    'home.viewAll': 'View All Produce',
    'home.testimonialsTitle': 'What Our Customers Say',
    'home.newsletterTitle': 'Get Fresh Deals Weekly',
    'home.newsletterSubtitle': 'Subscribe for seasonal harvest alerts, organic recipes, and direct-from-farmer exclusive discounts.',
    'home.subscribe': 'Subscribe',
    'home.enterEmail': 'Enter your email address...',

    // Marketplace
    'market.title': 'Browse Farm Fresh Harvest',
    'market.subtitle': 'Direct farmer listings harvested within 24 hours. No cold store preservatives.',
    'market.searchPlaceholder': 'Search farm fresh produce, vegetables, fruits, or farmer names...',
    'market.organicOnly': 'Organic Only',
    'market.sortFeatured': 'Sort: Featured',
    'market.sortPriceLow': 'Price: Low to High',
    'market.sortPriceHigh': 'Price: High to Low',
    'market.sortRating': 'Top Rated',
    'market.sortNewest': 'Fresh Harvest Date',
    'market.filters': 'Filters',
    'market.reset': 'Reset',
    'market.maxPrice': 'Max Price',
    'market.itemsFound': 'items found',
    'market.noItems': 'No produce found',
    'market.clearFilters': 'Clear All Filters',

    // Pagination
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'pagination.page': 'Page',
    'pagination.of': 'of',
    'pagination.showing': 'Showing',
    'pagination.itemsPerPage': 'per page',

    // Product Card
    'card.organic': '🌱 Organic',
    'card.organicSuggested': '🌱 Organic Suggested',
    'card.nonOrganic': 'Non-Organic',
    'card.harvest': 'Harvest',
    'card.inStock': 'in stock',
    'card.outOfStock': 'Out of stock',
    'card.soldOut': 'Sold Out',
    'card.add': 'Add',
    'card.added': 'Added',

    // Cart & Checkout
    'cart.title': 'Shopping Basket',
    'cart.empty': 'Your basket is empty',
    'cart.startShopping': 'Start Shopping',
    'cart.freeDeliveryUnlocked': '🎉 You have qualified for FREE Farm-to-Doorstep Delivery!',
    'cart.addMore': 'Add more to unlock FREE Morning Delivery',
    'cart.summary': 'Order Summary',
    'cart.subtotal': 'Subtotal',
    'cart.deliveryFee': 'Delivery Fee',
    'cart.ecoDelivery': 'Eco Cold Delivery',
    'cart.free': 'FREE',
    'cart.total': 'Total',
    'cart.totalPayable': 'Total Payable',
    'cart.checkout': 'Proceed to Checkout',
    'checkout.title': 'Checkout',
    'checkout.address': '1. Delivery Destination',
    'checkout.slot': '2. Delivery Slot',
    'checkout.payment': '3. Payment Option',
    'checkout.orderSummary': 'Order Summary',
    'checkout.placeOrder': 'Place Order',
    'checkout.orderConfirmed': 'Order Confirmed!',

    // Orders
    'orders.title': 'My Orders & Tracking',
    'orders.ref': 'Order Reference',
    'orders.placedOn': 'Placed on',
    'orders.estimatedArrival': 'Estimated Arrival',

    // Farmer Dashboard
    'farmer.welcome': 'welcome back!',
    'farmer.activeCrops': 'Active Crops',
    'farmer.totalSales': 'Total Sales',
    'farmer.soilMoisture': 'Soil Moisture Avg',
    'farmer.cropHealth': 'Crop Health Score',
    'farmer.weatherTitle': 'Farm Weather Conditions',
    'farmer.yieldTitle': 'Seasonal Yield Forecast',
    'farmer.plotStatusTitle': 'Registered Field Plots & Crop Status',
    'farmer.listHarvest': '+ List New Harvest',

    // Login Page
    'login.welcomeBack': 'Welcome Back',
    'login.subtitle': 'Sign in to access your direct farm market account',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.forgot': 'Forgot Password?',
    'login.show': 'Show',
    'login.hide': 'Hide',
    'login.signInBtn': 'Sign In',
    'login.or': 'OR',
    'login.continueWithGoogle': 'Continue with Google',
    'login.noAccount': "Don't have an account?",
    'login.registerHere': 'Register here',
    'login.demoHint': '🔒 Enter your registered email address and password to sign in securely.',

    // Footer
    'footer.mission': 'Connecting conscientious consumers directly with regenerative local farmers. Zero middlemen, maximum freshness, honest prices for growers.',
    'footer.shopFresh': 'Shop Fresh',
    'footer.portals': 'Portals',
    'footer.promise': 'Promise',
    'footer.rights': 'All rights reserved.',
  },

  ta: {
    // Header & Navigation
    'nav.announcement': '🌱 100% இயற்கை பொருட்கள் நேரடியாக உங்கள் இல்லத்திற்கு • FARM20 குறியீட்டுடன் 20% தள்ளுபடி',
    'nav.helpline': 'உதவி எண்',
    'nav.home': 'முகப்பு',
    'nav.marketplace': 'சந்தை',
    'nav.about': 'எங்களை பற்றி',
    'nav.contact': 'தொடர்புக்கு',
    'nav.signIn': 'உள்நுழை',
    'nav.farmerPortal': 'விவசாயி போர்டல்',
    'nav.adminPanel': 'நிர்வாகம்',
    'nav.myOrders': 'எனது ஆர்டர்கள்',
    'nav.cart': 'கூடை',
    'nav.signOut': 'வெளியேறு',
    'nav.farmDashboard': 'பண்ணை டாஷ்போர்டு',
    'nav.listProduce': 'புதிய விளைச்சல் சேர்க்க',
    'nav.manageCrops': 'பயிர்களை நிர்வகிக்க',
    'nav.customerOrders': 'வாடிக்கையாளர் ஆர்டர்கள்',
    'nav.deliveryPortal': 'டெலிவரி போர்டல்',
    'nav.deliveryDashboard': 'விநியோக டாஷ்போர்டு',
    'nav.deliveryPartner': 'விநியோக பங்குதாரர்',
    'nav.demoRole': 'பயனர் பங்கு',
    'nav.switchAccount': 'கணக்கை மாற்று',
    'nav.theme': 'தீம்',
    'nav.themeLight': 'வெளிச்சம் (Light)',
    'nav.themeDark': 'இருள் (Dark)',
    'nav.themeSystem': 'கணினி இயல்பு (System)',
    'nav.language': 'மொழி',

    // Hero & Home
    'home.heroBadge': '100% உள்ளூர் இயற்கை விவசாயிகளிடமிருந்து நேரடியாக',
    'home.heroTitle1': 'தோட்டத்திலிருந்து',
    'home.heroTitle2': 'உங்கள் இல்லத்திற்கு',
    'home.heroSubtitle': 'தினசரி அறுவடை செய்யப்படும் இயற்கை காய்கறிகள் மற்றும் பழங்கள். இடைத்தரகர்கள் இன்றி, வயலின் சத்துக்களும் புத்துணர்ச்சியும் மாறாமல் உங்களை வந்தடைகிறது.',
    'home.shopProduce': 'காய்கறிகளை வாங்க',
    'home.sellHarvest': 'விளைச்சலை விற்க',
    'home.organicCertified': 'சான்றளிக்கப்பட்ட இயற்கை',
    'home.localGrown': 'உள்ளூர் விளைச்சல்',
    'home.harvestFresh': 'புதிய அறுவடை',
    'home.zeroMiddlemen': 'இடைத்தரகர்கள் இல்லை',
    'home.farmersKeep': '85% வருமானம் விவசாயிகளுக்கே',
    'home.familiesServed': '12,000+ குடும்பங்கள் பயன்பெறுகின்றன',

    // Categories
    'home.categoriesTitle': 'வகைகள் வாரியாக வாங்க',
    'home.categoriesSubtitle': 'பூச்சிக்கொல்லி மருந்துகள் அற்ற, இயற்கை முறையில் விளைவிக்கப்பட்ட காய்கறிகள்.',
    'cat.all': 'அனைத்து பொருட்கள்',
    'cat.vegetables': 'காய்கறிகள்',
    'cat.fruits': 'பழங்கள்',
    'cat.grains': 'தானியங்கள் & சிறுதானியங்கள்',
    'cat.pulses': 'பருப்பு வகைகள்',
    'cat.dairy': 'பால் பொருட்கள்',
    'cat.spices': 'மூலிகைகள் & மசாலா',
    'cat.herbs': 'கீரைகள் & மூலிகைகள்',
    'cat.bundles': 'குடும்ப தொகுப்புகள்',
    'nav.wishlist': 'விருப்பப்பட்டியல்',

    // Process & Promise
    'home.processBadge': 'எளிமையான செயல்முறை',
    'home.processTitle': 'வயலிலிருந்து உங்கள் சமையலறைக்கு',
    'home.processSubtitle': 'கிடங்குகளில் தேக்கி வைக்காமல், ஆர்டர் செய்த 24 மணி நேரத்திற்குள் வயலில் பறித்து உங்கள் வீட்டிற்கு அனுப்புகிறோம்.',
    'home.step1Title': 'பொருட்களை தேர்வு செய்க',
    'home.step1Desc': 'விவசாயிகளால் நேரடியாக பட்டியலிடப்பட்ட இயற்கை காய்கறி, பழங்கள் மற்றும் தொகுப்புகளை தேர்வு செய்யுங்கள்.',
    'home.step2Title': 'தினசரி அறுவடை செய்கிறோம்',
    'home.step2Desc': 'அதிகாலை வேளையில் இயற்கை சுவையும் புத்துணர்ச்சியும் மாறாமல் செடியிலிருந்து அறுவடை செய்யப்படுகிறது.',
    'home.step3Title': 'உங்கள் இல்லத்திற்கே விநியோகம்',
    'home.step3Desc': 'குளிர்சாதன சூழல்-நட்பு வாகனங்கள் மூலம் காய்கறிகள் வாடாமல் உங்கள் இல்லம் வந்தடைகிறது.',

    'home.promiseTitle': 'எங்கள் பசுமை உறுதிமொழி',
    'home.promiseSubtitle': 'மண்ணிலிருந்து உங்கள் வீட்டு வாசல் வரை தரம் குறையாமல் இருக்க உறுதியளிக்கிறோம்.',
    'home.promise1Title': '100% இயற்கை வேளாண்மை',
    'home.promise1Desc': 'ரசாயன உரங்கள் மற்றும் பூச்சிக்கொல்லிகள் இல்லாத ஆரோக்கியமான விளைச்சல்.',
    'home.promise2Title': 'தினசரி புத்தம் புதியது',
    'home.promise2Desc': 'தினமும் காலையில் அறுவடை செய்து வைட்டமின்களும் சத்துக்களும் நிறைந்த நிலையில் விநியோகம்.',
    'home.promise3Title': 'விரைவான இலவச விநியோகம்',
    'home.promise3Desc': 'நாட்கள் தாமதிக்காமல் சில மணிநேரங்களில் விநியோகம். ₹500க்கு மேல் இலவசம்.',
    'home.promise4Title': 'சுற்றுச்சூழல் பாதுகாப்பு',
    'home.promise4Desc': 'மக்கும் இயற்கை பேக்கிங் மற்றும் விவசாயிகளுக்கு உரிய நியாயமான ஊதியம்.',

    'home.favoritesTitle': 'வாடிக்கையாளர்களின் விருப்பங்கள்',
    'home.favoritesSubtitle': 'இந்த வாரம் அதிக மக்களால் விரும்பி வாங்கப்பட்ட இயற்கை விளைபொருட்கள்.',
    'home.viewAll': 'அனைத்து விளைபொருட்கள்',
    'home.testimonialsTitle': 'வாடிக்கையாளர் கருத்துக்கள்',
    'home.newsletterTitle': 'வாராந்திர சலுகைகள் பெறுங்கள்',
    'home.newsletterSubtitle': 'அறுவடை செய்திகள், இயற்கை சமையல் குறிப்புகள் மற்றும் சிறப்பு தள்ளுபடிகளுக்கு பதிவு செய்யுங்கள்.',
    'home.subscribe': 'பதிவு செய்',
    'home.enterEmail': 'உங்கள் மின்னஞ்சலை உள்ளிடவும்...',

    // Marketplace
    'market.title': 'இயற்கை விளைபொருட்கள் சந்தை',
    'market.subtitle': '24 மணி நேரத்திற்குள் அறுவடை செய்யப்பட்ட விவசாயிகளின் நேரடி பொருட்கள்.',
    'market.searchPlaceholder': 'காய்கறிகள், பழங்கள் அல்லது விவசாயியின் பெயரை தேடுங்கள்...',
    'market.organicOnly': 'இயற்கை மட்டுமே',
    'market.sortFeatured': 'வரிசை: சிறப்பு',
    'market.sortPriceLow': 'விலை: குறைந்தது முதல் அதிகம்',
    'market.sortPriceHigh': 'விலை: அதிகம் முதல் குறைந்தது',
    'market.sortRating': 'அதிக மதிப்பீடு',
    'market.sortNewest': 'அறுவடை தேதி',
    'market.filters': 'வடிகட்டிகள்',
    'market.reset': 'மீட்டமை',
    'market.maxPrice': 'அதிகபட்ச விலை',
    'market.itemsFound': 'பொருட்கள் உள்ளன',
    'market.noItems': 'பொருட்கள் எதுவும் கிடைக்கவில்லை',
    'market.clearFilters': 'வடிகட்டிகளை நீக்கு',

    // Pagination
    'pagination.previous': 'முந்தையது',
    'pagination.next': 'அடுத்தது',
    'pagination.page': 'பக்கம்',
    'pagination.of': '/',
    'pagination.showing': 'காட்டப்படும் பொருட்கள்',
    'pagination.itemsPerPage': 'ஒரு பக்கத்திற்கு',

    // Product Card
    'card.organic': '🌱 இயற்கை',
    'card.organicSuggested': '🌱 இயற்கை பரிந்துரை',
    'card.nonOrganic': 'இயற்கை சாரா (Non-Organic)',
    'card.harvest': 'அறுவடை',
    'card.inStock': 'இருப்பில் உள்ளது',
    'card.outOfStock': 'இருப்பில் இல்லை',
    'card.soldOut': 'விற்றுத் தீர்ந்தது',
    'card.add': 'சேர்',
    'card.added': 'சேர்க்கப்பட்டது',

    // Cart & Checkout
    'cart.title': 'உங்கள் கூடை',
    'cart.empty': 'உங்கள் கூடை காலியாக உள்ளது',
    'cart.startShopping': 'பொருட்களை வாங்க தொடங்குங்கள்',
    'cart.freeDeliveryUnlocked': '🎉 உங்களுக்கு இலவச விநியோகம் கிடைத்துள்ளது!',
    'cart.addMore': 'இலவச விநியோகத்திற்கு மேலும் பொருட்களை சேர்க்கவும்',
    'cart.summary': 'ஆர்டர் சுருக்கம்',
    'cart.subtotal': 'கூட்டுத்தொகை',
    'cart.deliveryFee': 'விநியோக கட்டணம்',
    'cart.ecoDelivery': 'குளிர்சாதன நேரடி விநியோகம்',
    'cart.free': 'இலவசம்',
    'cart.total': 'மொத்தம்',
    'cart.totalPayable': 'செலுத்த வேண்டிய தொகை',
    'cart.checkout': 'செக்அவுட் தொடரவும்',
    'checkout.title': 'செக்அவுட்',
    'checkout.address': '1. விநியோக முகவரி',
    'checkout.slot': '2. விநியோக நேரம்',
    'checkout.payment': '3. பணம் செலுத்தும் முறை',
    'checkout.orderSummary': 'ஆர்டர் விவரம்',
    'checkout.placeOrder': 'ஆர்டரை உறுதி செய்',
    'checkout.orderConfirmed': 'ஆர்டர் உறுதி செய்யப்பட்டது!',

    // Orders
    'orders.title': 'எனது ஆர்டர்கள் & கண்காணிப்பு',
    'orders.ref': 'ஆர்டர் எண்',
    'orders.placedOn': 'ஆர்டர் தேதி',
    'orders.estimatedArrival': 'எதிர்பார்க்கப்படும் நேரம்',

    // Farmer Dashboard
    'farmer.welcome': 'மீண்டும் வருக!',
    'farmer.activeCrops': 'பயிர்களின் எண்ணிக்கை',
    'farmer.totalSales': 'மொத்த விற்பனை',
    'farmer.soilMoisture': 'மண் ஈரப்பதம்',
    'farmer.cropHealth': 'பயிர் ஆரோக்கிய மதிப்பீடு',
    'farmer.weatherTitle': 'பண்ணை வானிலை நிலவரம்',
    'farmer.yieldTitle': 'பருவகால மகசூல் கணிப்பு',
    'farmer.plotStatusTitle': 'பதிவுசெய்த நிலப்பரப்பு மற்றும் பயிர் நிலை',
    'farmer.listHarvest': '+ புதிய விளைச்சல் சேர்க்க',

    // Login Page
    'login.welcomeBack': 'மீண்டும் வருக',
    'login.subtitle': 'உங்கள் பண்ணை சந்தை கணக்கில் நுழைய உள்நுழையவும்',
    'login.email': 'மின்னஞ்சல் முகவரி',
    'login.password': 'கடவுச்சொல்',
    'login.forgot': 'கடவுச்சொல் மறந்துவிட்டதா?',
    'login.show': 'காட்டு',
    'login.hide': 'மறை',
    'login.signInBtn': 'உள்நுழைக',
    'login.or': 'அல்லது',
    'login.continueWithGoogle': 'கூகுள் மூலம் தொடர்க (Google)',
    'login.noAccount': 'கணக்கு இல்லையா?',
    'login.registerHere': 'இங்கே பதிவு செய்யுங்கள்',
    'login.demoHint': '🔒 பாதுகாப்பாக உள்நுழைய உங்கள் பதிவுசெய்த மின்னஞ்சல் முகவரி மற்றும் கடவுச்சொல்லை உள்ளிடவும்.',

    // Footer
    'footer.mission': 'விவசாயிகளையும் நுகர்வோரையும் நேரடியாக இணைக்கும் தளம். இடைத்தரகர்கள் இன்றி, உழவர்களுக்கு நியாயமான விலை, வாடிக்கையாளர்களுக்கு புத்தம் புதிய உணவு.',
    'footer.shopFresh': 'புதிய பொருட்கள்',
    'footer.portals': 'போர்ட்டல்கள்',
    'footer.promise': 'உறுதிமொழி',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('farmstore_lang');
    return saved === 'ta' ? 'ta' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('farmstore_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  // Helper translation function
  const t = (key, fallback = '') => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to English if translation is missing
    if (TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
