import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "bn" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation & Header
  topBanner: {
    bn: "🚚 সারাদেশে ক্যাশ অন ডেলিভারি | 🌿 ১০০% প্রাকৃতিক ও খাঁটি জৈব পণ্য | 📞 হটলাইন: +৮৮০ ১৭১১-২২৩৩৪৪",
    en: "🚚 Cash on Delivery Nationwide | 🌿 100% Organic & Pure Produce | 📞 Hotline: +880 1711-223344",
  },
  home: { bn: "হোম", en: "Home" },
  shop: { bn: "শপ", en: "Shop" },
  categories: { bn: "ক্যাটাগরি", en: "Categories" },
  about: { bn: "আমাদের কথা", en: "About" },
  contact: { bn: "যোগাযোগ", en: "Contact" },
  orders: { bn: "অর্ডার", en: "Orders" },
  account: { bn: "মাই একাউন্ট", en: "Account" },
  cart: { bn: "কার্ট", en: "Cart" },
  searchPlaceholder: {
    bn: "খুঁজুন সুন্দরবনের মধু, ঘি, অর্গানিক তেল, শাক-সবজি...",
    en: "Search honey, ghee, mustard oil, vegetables...",
  },

  // Hero Section
  heroBadge: { bn: "🌿 ১০০% সার্টিফাইড অর্গানিক", en: "🌿 100% Certified Organic" },
  heroTitle: {
    bn: "বিশুদ্ধ। সতেজ। সবসময় অর্গানিক।",
    en: "Pure. Fresh. Always Organic.",
  },
  heroSubtitle: {
    bn: "কৃষকের মাঠ থেকে সরাসরি কেমিক্যালমুক্ত অর্গানিক পণ্য পৌঁছাচ্ছি আপনার ঘরে।",
    en: "Bringing you the finest organic goodness, straight from nature to your doorstep.",
  },
  shopNow: { bn: "এখনই কিনুন", en: "Shop Now" },

  // Trust Badges
  trust1Title: { bn: "১০০% অর্গানিক", en: "100% Organic" },
  trust1Desc: { bn: "সম্পূর্ণ প্রাকৃতি ও সারমুক্ত", en: "Pure & Natural Produce" },
  trust2Title: { bn: "কেমিক্যাল মুক্ত", en: "Chemical Free" },
  trust2Desc: { bn: "ক্ষতিকারক কীটনাশক ছাড়া", en: "No Harmful Pesticides" },
  trust3Title: { bn: "দ্রুত ডেলিভারি", en: "Fast Delivery" },
  trust3Desc: { bn: "আপনার দোরগোড়ায় দ্রুত পৌঁছাবে", en: "Express Delivery at Doorstep" },
  trust4Title: { bn: "গুণমানের নিশ্চয়তা", en: "Satisfaction" },
  trust4Desc: { bn: "১০০% শতভাগ খাঁটি পণ্য", en: "100% Quality Guaranteed" },

  // Sections
  bestSellers: { bn: "সেরা বিক্রিত পণ্যসমূহ", en: "Best Sellers" },
  viewAll: { bn: "সবগুলো দেখুন", en: "View All" },
  shopByCategory: { bn: "ক্যাটাগরি অনুযায়ী কেনাকাটা", en: "Shop by Category" },
  customerReviews: { bn: "গ্রাহকদের মতামত", en: "Customer Testimonials" },

  // Categories
  catVegetables: { bn: "শাক-সবজি", en: "Vegetables" },
  catFruits: { bn: "ফলমূল", en: "Fruits" },
  catLeafyGreens: { bn: "সবুজ শাক", en: "Leafy Greens" },
  catHerbal: { bn: "ভেষজ ও চা", en: "Herbal & Tea" },
  catDairy: { bn: "দুধ ও ঘি", en: "Dairy & Ghee" },
  catGrains: { bn: "চাল ও ডাল", en: "Grains & Pulses" },
  catHoney: { bn: "খাঁটি মধু", en: "Pure Honey" },
  catOils: { bn: "তেল ও ঘি", en: "Oils & Ghee" },
  catSeeds: { bn: "বীজ ও বাদাম", en: "Seeds & Nuts" },
  catSpices: { bn: "বিশুদ্ধ মশলা", en: "Spices" },

  // Product Card
  organic: { bn: "অর্গানিক", en: "Organic" },
  addToCart: { bn: "কার্টে যোগ করুন", en: "Add to Cart" },
  added: { bn: "যোগ করা হয়েছে", en: "Added" },
  stockOut: { bn: "স্টক আউট", en: "Stock Out" },
  organicChoice: { bn: "দেশি পছন্দ", en: "Organic Choice" },

  // Cart & Checkout
  checkout: { bn: "অর্ডার কনফার্ম করুন", en: "Checkout" },
  subtotal: { bn: "সাবটোটাল", en: "Subtotal" },
  deliveryCharge: { bn: "ডেলিভারি চার্জ", en: "Delivery Charge" },
  total: { bn: "সর্বমোট", en: "Total" },
  codNotice: { bn: "ক্যাশ অন ডেলিভারি সুবিধা আছে", en: "Cash on Delivery Available" },
  orderSuccess: { bn: "আপনার অর্ডারটি সফল হয়েছে!", en: "Your Order is Confirmed!" },
  fullName: { bn: "আপনার নাম", en: "Full Name" },
  mobileNumber: { bn: "মোবাইল নম্বর", en: "Mobile Number" },
  address: { bn: "পূর্ণাঙ্গ ঠিকানা", en: "Full Delivery Address" },
  placeOrder: { bn: "অর্ডার সাবমিট করুন", en: "Place Order Now" },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "bn",
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("purebengal_lang") as Language;
    if (saved === "bn" || saved === "en") {
      setLangState(saved);
    } else {
      // Default to Bangla
      setLangState("bn");
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("purebengal_lang", newLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
