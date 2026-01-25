import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const translations = {
  ar: {
    // Navbar
    "nav.browse": "تصفح",
    "nav.products": "المنتجات",
    "nav.contact": "تواصل معنا",
    "nav.signIn": "تسجيل الدخول",
    "nav.signOut": "تسجيل الخروج",
    "nav.profile": "الملف الشخصي",

    // Hero
    "hero.badge": "أكثر من 500+ منتج متوفر",
    "hero.title": "منزلك،",
    "hero.titleHighlight": "أرقى",
    "hero.description": "اكتشف أدوات منزلية مميزة وعصرية للمطبخ والتنظيف وغرفة النوم.",
    "hero.searchPlaceholder": "ابحث عن المنتجات...",
    "hero.search": "بحث",
    "hero.popular": "الأكثر بحثاً:",
    "hero.tag.mealPrep": "تحضير الوجبات",
    "hero.tag.organization": "التنظيم",
    "hero.tag.cleaningHacks": "حيل التنظيف",

    // Filters
    "filters.title": "الفلاتر",
    "filters.reset": "إعادة ضبط",
    "rating.up": "فأكثر",

    // Products
    "products.title": "استكشف",
    "products.titleHighlight": "المنتجات",
    "products.subtitle": "اعثر على الأدوات المنزلية المثالية لمنزلك",
    "products.noResults": "لا توجد منتجات مطابقة لبحثك.",
    "products.featured": "مميز",
    "products.department": "القسم",
    "products.customerReview": "تقييمات العملاء",

    // Categories
    "category.all": "جميع المنتجات",
    "category.kitchen-tools": "أدوات المطبخ",
    "category.home-decor": "ديكور المنزل",
    "category.cleaning-supplies": "مستلزمات التنظيف",

    // Subcategories
    "subcategory.water-bottles": "زجاجات المياه",
    "subcategory.spoons": "ملاعق",
    "subcategory.forks": "شوكات",
    "subcategory.knives": "سكاكين",
    "subcategory.cutlery-sets": "أطقم أدوات المائدة",
    "subcategory.lunch-boxes": "صناديق الغداء",
    "subcategory.blenders": "خلاطات",
    "subcategory.hand-blenders": "خلاطات يدوية",

    // Creator Spotlight
    "creator.title": "أضواء على",
    "creator.titleHighlight": "المبدعين",
    "creator.subtitle": "تعرف على الخبراء وراء منتجاتنا الأكثر مبيعاً",
    "creator.products": "منتج",
    "creator.sales": "مبيعات",
    "creator.viewProfile": "عرض الملف",

    // Footer
    "footer.description": "وجهتك للأدوات المنزلية المميزة والعصرية.",
    "footer.marketplace": "المتجر",
    "footer.browseProducts": "تصفح المنتجات",
    "footer.categories": "الفئات",
    "footer.featured": "المميزة",
    "footer.newArrivals": "وصل حديثاً",
    "footer.bestSellers": "الأكثر مبيعاً",
    "footer.support": "الدعم",
    "footer.helpCenter": "مركز المساعدة",
    "footer.contactUs": "اتصل بنا",
    "footer.faqs": "الأسئلة الشائعة",
    "footer.refundPolicy": "سياسة الاسترجاع",
    "footer.terms": "شروط الخدمة",
    "footer.privacy": "سياسة الخصوصية",
    "footer.stayUpdated": "ابقَ على اطلاع",
    "footer.newsletter": "احصل على أحدث المنتجات والعروض الحصرية.",
    "footer.emailPlaceholder": "أدخل بريدك الإلكتروني",
    "footer.copyright": "© 2024 معرض الطباخ. جميع الحقوق محفوظة.",
    "footer.cookies": "ملفات تعريف الارتباط",

    // Auth
    "auth.backToHome": "العودة للرئيسية",
    "auth.welcomeBack": "مرحباً بعودتك",
    "auth.createAccount": "إنشاء حساب",
    "auth.signInSubtitle": "سجل الدخول للوصول إلى مشترياتك",
    "auth.signUpSubtitle": "سجل للبدء بالتسوق",
    "auth.displayName": "الاسم",
    "auth.displayNamePlaceholder": "اسمك",
    "auth.email": "البريد الإلكتروني",
    "auth.emailPlaceholder": "example@email.com",
    "auth.password": "كلمة المرور",
    "auth.passwordPlaceholder": "••••••••",
    "auth.signingIn": "جاري تسجيل الدخول...",
    "auth.creatingAccount": "جاري إنشاء الحساب...",
    "auth.signIn": "تسجيل الدخول",
    "auth.noAccount": "ليس لديك حساب؟ سجل الآن",
    "auth.hasAccount": "لديك حساب بالفعل؟ سجل الدخول",
    "auth.loginFailed": "فشل تسجيل الدخول",
    "auth.invalidCredentials": "بريد إلكتروني أو كلمة مرور غير صحيحة.",
    "auth.signUpFailed": "فشل إنشاء الحساب",
    "auth.accountExists": "يوجد حساب بهذا البريد. يرجى تسجيل الدخول.",
    "auth.welcomeBackToast": "مرحباً بعودتك!",
    "auth.successLogin": "تم تسجيل الدخول بنجاح.",
    "auth.accountCreated": "تم إنشاء الحساب!",
    "auth.welcomeToStore": "مرحباً بك في معرض الطباخ!",

    // Profile
    "profile.title": "ملفي الشخصي",
    "profile.purchases": "مشترياتي",
    "profile.noPurchases": "لا توجد مشتريات بعد.",
    "dir": "rtl",
  },
  en: {
    // Navbar
    "nav.browse": "Browse",
    "nav.products": "Products",
    "nav.contact": "Contact Us",
    "nav.signIn": "Sign In",
    "nav.signOut": "Sign Out",
    "nav.profile": "Profile",

    // Hero
    "hero.badge": "Over 500+ products available",
    "hero.title": "Your Home,",
    "hero.titleHighlight": "Elevated",
    "hero.description": "Discover premium home tools, templates, and resources for kitchen, cleaning, and bedroom organization.",
    "hero.searchPlaceholder": "Search for products...",
    "hero.search": "Search",
    "hero.popular": "Popular:",
    "hero.tag.mealPrep": "Meal Prep",
    "hero.tag.organization": "Organization",
    "hero.tag.cleaningHacks": "Cleaning Hacks",

    // Filters
    "filters.title": "Filters",
    "filters.reset": "Reset",
    "rating.up": "& Up",

    // Products
    "products.title": "Explore",
    "products.titleHighlight": "Products",
    "products.subtitle": "Find the perfect home resources for your needs",
    "products.noResults": "No products found matching your criteria.",
    "products.featured": "Featured",
    "products.department": "Department",
    "products.customerReview": "Customer Review",

    // Categories
    "category.all": "All Products",
    "category.kitchen-tools": "Kitchen Tools",
    "category.home-decor": "Home Décor",
    "category.cleaning-supplies": "Cleaning Supplies",

    // Subcategories
    "subcategory.water-bottles": "Water Bottles",
    "subcategory.spoons": "Spoons",
    "subcategory.forks": "Forks",
    "subcategory.knives": "Knives",
    "subcategory.cutlery-sets": "Cutlery Sets",
    "subcategory.lunch-boxes": "Lunch Boxes",
    "subcategory.blenders": "Blenders",
    "subcategory.hand-blenders": "Hand Blenders",

    // Creator Spotlight
    "creator.title": "Creator",
    "creator.titleHighlight": "Spotlight",
    "creator.subtitle": "Meet the experts behind our best-selling products",
    "creator.products": "Products",
    "creator.sales": "Sales",
    "creator.viewProfile": "View Profile",

    // Footer
    "footer.description": "Your destination for premium home organization resources.",
    "footer.marketplace": "Marketplace",
    "footer.browseProducts": "Browse Products",
    "footer.categories": "Categories",
    "footer.featured": "Featured",
    "footer.newArrivals": "New Arrivals",
    "footer.bestSellers": "Best Sellers",
    "footer.support": "Support",
    "footer.helpCenter": "Help Center",
    "footer.contactUs": "Contact Us",
    "footer.faqs": "FAQs",
    "footer.refundPolicy": "Refund Policy",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.stayUpdated": "Stay Updated",
    "footer.newsletter": "Get the latest products and exclusive deals.",
    "footer.emailPlaceholder": "Enter your email",
    "footer.copyright": "© 2024 Al-Tabbakh Store. All rights reserved.",
    "footer.cookies": "Cookies",

    // Auth
    "auth.backToHome": "Back to Home",
    "auth.welcomeBack": "Welcome back",
    "auth.createAccount": "Create account",
    "auth.signInSubtitle": "Sign in to access your purchases",
    "auth.signUpSubtitle": "Sign up to start shopping",
    "auth.displayName": "Display Name",
    "auth.displayNamePlaceholder": "Your name",
    "auth.email": "Email",
    "auth.emailPlaceholder": "you@example.com",
    "auth.password": "Password",
    "auth.passwordPlaceholder": "••••••••",
    "auth.signingIn": "Signing in...",
    "auth.creatingAccount": "Creating account...",
    "auth.signIn": "Sign In",
    "auth.noAccount": "Don't have an account? Sign up",
    "auth.hasAccount": "Already have an account? Sign in",
    "auth.loginFailed": "Login failed",
    "auth.invalidCredentials": "Invalid email or password. Please try again.",
    "auth.signUpFailed": "Sign up failed",
    "auth.accountExists": "An account with this email already exists. Please sign in instead.",
    "auth.welcomeBackToast": "Welcome back!",
    "auth.successLogin": "You have successfully logged in.",
    "auth.accountCreated": "Account created!",
    "auth.welcomeToStore": "Welcome to Al-Tabbakh Store!",

    // Profile
    "profile.title": "My Profile",
    "profile.purchases": "My Purchases",
    "profile.noPurchases": "No purchases yet.",
    "dir": "ltr",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
