import { uiEnglish, uiExtraEnglish, uiExtraTranslations, uiFlowEnglish, uiFlowTranslations, uiTranslations } from "./i18n.ui";

export const localeOptions = [
  { code: "en", label: "English", nativeLabel: "English", short: "EN" },
  { code: "fr", label: "French", nativeLabel: "Français", short: "FR" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", short: "中" },
  { code: "yo", label: "Yoruba", nativeLabel: "Yorùbá", short: "YO" },
  { code: "ig", label: "Igbo", nativeLabel: "Igbo", short: "IG" },
  { code: "ha", label: "Hausa", nativeLabel: "Hausa", short: "HA" },
] as const;

export type Locale = (typeof localeOptions)[number]["code"];

const english = {
  localeName: "English",
  language: "Language",
  home: "Home",
  searchProducts: "Search products, brands and essentials",
  searchPlaceholder: "Search",
  shop: "Shop",
  electronics: "Electronics",
  saved: "Saved",
  account: "Account",
  bag: "Bag",
  deliveringTo: "Delivering to",
  change: "Change",
  localStockLive: "Local stock is live",
  shapingCatalogue: "We're shaping your catalogue around your location",
  seeWhatsClose: "See what's close →",
  storeServing: "Store now serving {location}",
  everythingFor: "Everything for your",
  actualLife: "actual life.",
  heroDescription: "Fresh food, electronics and everyday essentials from the store closest to you — delivered when you need them.",
  search: "Search",
  shopEverything: "Shop everything",
  sameDayDelivery: "Same-day delivery",
  liveLocalStock: "Live local stock",
  secureCheckout: "Secure checkout",
  openNow: "Open now",
  closestStore: "Closest KlemStore",
  popularPicks: "Popular picks near you",
  updatedItems: "Updated just now · 120+ items available",
  shopThisStore: "Shop this store",
  browseDepartments: "Browse departments",
  shopByDepartment: "Shop by department",
  viewAll: "View all",
  popularNear: "Popular near Ikeja",
  pickedForDay: "Picked for your day",
  featuredDescription: "Reliable favourites, fresh arrivals and useful tech available from your closest store right now.",
  shopAllProducts: "Shop all products",
  whyKlemStore: "Why KlemStore",
  yourStoreFollows: "Your store follows",
  yourLocation: "your location.",
  alwaysNearby: "Always nearby",
  nearbyDescription: "We route your basket to the best store for your address.",
  builtForToday: "Built for today",
  stockDescription: "Stock and delivery estimates reflect what is actually available.",
  simpleAllTheWay: "Simple all the way",
  simpleDescription: "One basket, one checkout, no confusing store switching.",
  newInElectronics: "New in electronics",
  usefulTech: "Useful tech,",
  closeAtHand: "close at hand.",
  techDescription: "Earbuds, screens, power and speakers from your nearby store.",
  shopElectronics: "Shop electronics",
  localFavourites: "Local favourites",
  goodThings: "Good things",
  forToday: "for today.",
  foodDescription: "Fresh food and everyday staples selected around your location.",
  shopFood: "Shop food & groceries",
  keepLifeMoving: "Keep life moving",
  everydayEssentials: "Everyday essentials",
  essentialsDescription: "The dependable food, home and technology you want within easy reach.",
  shopEssentials: "Shop essentials",
  powerYourDay: "Power your day",
  electronicsAccessories: "Electronics & accessories",
  electronicsDescription: "Useful tech, available locally and ready for delivery from the store closest to you.",
  footerTagline: "Everything for your actual life.",
  footerDescription: "Food, electronics and useful things for the way you actually live.",
  footerShop: "Shop",
  shopEverythingLink: "Shop everything",
  foodGroceries: "Food & groceries",
  homeCare: "Home & care",
  footerYourStore: "Your KlemStore",
  yourAccount: "Your account",
  trackOrder: "Track an order",
  savedProducts: "Saved products",
  helpContact: "Help & contact",
  stayInLoop: "Stay in the loop",
  newsletterDescription: "New arrivals, useful deals and local store updates. No noise.",
  emailPlaceholder: "Your email address",
  localStockStatus: "Local stock, live",
  servingLocations: "Serving Ikeja and nearby locations",
  royalBlueShopping: "Royal-blue shopping, wherever you are.",
  privacyTerms: "Privacy · Terms",
  department: "Department",
  catalogue: "KlemStore catalogue",
  shopEverythingHeading: "Shop everything",
  catalogueDescription: "Everything from fresh food and pantry staples to electronics and useful things for home — available from the store closest to you.",
  availableFromStore: "Available from the closest store serving your location, with stock and delivery times updated for this shop.",
  shoppingFor: "Shopping for",
  products: "products",
  sortBy: "Sort by",
  featured: "Featured",
  lowToHigh: "Price: low to high",
  highToLow: "Price: high to low",
  departments: "Departments",
  localStock: "Local stock",
  localStockDescription: "Prices and availability are based on Ikeja.",
  searchResultsFor: "Search results for",
  clearSearch: "Clear search",
  noProductsFound: "No products found",
  noProductsDescription: "Try a different product name, category or brand. We'll keep the search scoped to your current department.",
  backToShop: "Back to shop",
  addToBag: "Add to bag",
  addedToBag: "Added to bag",
  ...uiEnglish,
  ...uiExtraEnglish,
  ...uiFlowEnglish,
} as const;

export type TranslationKey = keyof typeof english;
export type TranslationDictionary = Record<TranslationKey, string>;

const translated = (overrides: Partial<TranslationDictionary>): TranslationDictionary => ({ ...english, ...overrides });

export const translations: Record<Locale, TranslationDictionary> = {
  en: english,
  fr: translated({ localeName: "Français", language: "Langue", home: "Accueil", shop: "Boutique", electronics: "Électronique", saved: "Favoris", account: "Compte", bag: "Panier", deliveringTo: "Livrer à", change: "Modifier", localStockLive: "Le stock local est en direct", shapingCatalogue: "Nous adaptons votre catalogue à votre emplacement", seeWhatsClose: "Voir ce qui est proche →", storeServing: "Magasin disponible à {location}", everythingFor: "Tout pour votre", actualLife: "vie réelle.", heroDescription: "Alimentation fraîche, électronique et essentiels du quotidien depuis le magasin le plus proche — livrés quand vous en avez besoin.", search: "Rechercher", searchPlaceholder: "Rechercher", shopEverything: "Tout découvrir", sameDayDelivery: "Livraison le jour même", liveLocalStock: "Stock local en direct", secureCheckout: "Paiement sécurisé", openNow: "Ouvert maintenant", closestStore: "KlemStore le plus proche", popularPicks: "Populaires près de chez vous", updatedItems: "Mis à jour maintenant · 120+ articles disponibles", shopThisStore: "Visiter ce magasin", browseDepartments: "Parcourir les rayons", shopByDepartment: "Acheter par rayon", viewAll: "Tout voir", popularNear: "Populaire à Ikeja", pickedForDay: "Choisis pour vous", featuredDescription: "Les favoris fiables, les nouveautés et la technologie utile disponibles dans votre magasin le plus proche.", shopAllProducts: "Voir tous les produits", whyKlemStore: "Pourquoi KlemStore", yourStoreFollows: "Votre magasin suit", yourLocation: "votre emplacement.", newInElectronics: "Nouveautés électroniques", shopElectronics: "Voir l'électronique", localFavourites: "Favoris locaux", forToday: "pour aujourd'hui.", shopFood: "Voir les produits alimentaires", keepLifeMoving: "Pour votre quotidien", everydayEssentials: "Essentiels du quotidien", shopEssentials: "Voir les essentiels", powerYourDay: "Pour bien commencer", electronicsAccessories: "Électronique et accessoires", department: "Rayon", catalogue: "Catalogue KlemStore", shopEverythingHeading: "Tout acheter", shoppingFor: "Adresse de livraison", products: "produits", sortBy: "Trier par", featured: "En vedette", departments: "Rayons", localStock: "Stock local", clearSearch: "Effacer la recherche", noProductsFound: "Aucun produit trouvé", addToBag: "Ajouter au panier", addedToBag: "Ajouté au panier" }),
  zh: translated({ localeName: "中文", language: "语言", home: "首页", shop: "商城", electronics: "电子产品", saved: "收藏", account: "账户", bag: "购物袋", deliveringTo: "配送至", change: "更改", localStockLive: "本地库存实时更新", shapingCatalogue: "我们会根据您的位置调整商品目录", seeWhatsClose: "查看附近商品 →", storeServing: "正在服务 {location}", everythingFor: "满足您", actualLife: "真实生活的一切。", heroDescription: "新鲜食品、电子产品和日常用品，来自离您最近的门店，按需送达。", search: "搜索", searchPlaceholder: "搜索", shopEverything: "浏览全部商品", sameDayDelivery: "当日配送", liveLocalStock: "本地库存实时", secureCheckout: "安全结账", openNow: "正在营业", closestStore: "最近的 KlemStore", popularPicks: "附近热门商品", updatedItems: "刚刚更新 · 120+ 件商品可用", shopThisStore: "进入此门店", browseDepartments: "浏览部门", shopByDepartment: "按部门购物", viewAll: "查看全部", popularNear: "Ikeja 热门商品", pickedForDay: "为您精选", shopAllProducts: "查看全部商品", whyKlemStore: "选择 KlemStore 的理由", yourStoreFollows: "门店跟随", yourLocation: "您的位置。", newInElectronics: "电子新品", shopElectronics: "浏览电子产品", localFavourites: "本地精选", forToday: "为今天准备。", shopFood: "浏览食品杂货", keepLifeMoving: "让生活更顺畅", everydayEssentials: "日常必需品", shopEssentials: "浏览必需品", powerYourDay: "为一天充电", electronicsAccessories: "电子产品和配件", department: "部门", catalogue: "KlemStore 商品目录", shopEverythingHeading: "浏览全部商品", shoppingFor: "购物位置", products: "件商品", sortBy: "排序", featured: "精选", departments: "部门", localStock: "本地库存", clearSearch: "清除搜索", noProductsFound: "未找到商品", addToBag: "加入购物袋", addedToBag: "已加入购物袋" }),
  yo: translated({ localeName: "Yorùbá", language: "Èdè", home: "Ilé", shop: "Ọjà", electronics: "Ẹ̀rọ ìmọ̀ ẹ̀rọ", saved: "Àwọn tí a fipamọ́", account: "Àkáǹtì", bag: "Àpò", deliveringTo: "Fífiranṣẹ́ sí", change: "Yí padà", localStockLive: "Ọjà tó wà nítòsí wà lórí ayé", shapingCatalogue: "A ń ṣètò ọjà rẹ̀ gẹ́gẹ́ bí ibi tí o wà", seeWhatsClose: "Wo ohun tó wà nítòsí →", storeServing: "Ọjà ń ṣiṣẹ́ fún {location}", everythingFor: "Ohun gbogbo fún", actualLife: "ìgbésí ayé rẹ gidi.", heroDescription: "Oúnjẹ tuntun, ẹ̀rọ ìmọ̀ ẹ̀rọ àti ohun pàtàkì ojoojúmọ́ láti ọjà tó sún mọ́ ọ jù — a ó mú un dé nígbà tí o bá nílò rẹ̀.", search: "Wá", searchPlaceholder: "Wá", shopEverything: "Ra ohun gbogbo", sameDayDelivery: "Fífiranṣẹ́ ní ọjọ́ kan náà", liveLocalStock: "Ọjà tó wà nítòsí", secureCheckout: "Ìsanwó tó ní ààbò", openNow: "Ó ṣí báyìí", closestStore: "KlemStore tó sún mọ́ ọ jù", popularPicks: "Àwọn ohun tí wọ́n fẹ́ràn nítòsí rẹ", updatedItems: "A ṣe àtúnṣe báyìí · Àwọn ohun 120+ wà", shopThisStore: "Ra ní ọjà yìí", browseDepartments: "Wo àwọn ẹ̀ka", shopByDepartment: "Ra ní ẹ̀ka", viewAll: "Wo gbogbo rẹ̀", popularNear: "Àwọn tí ó gbajúmọ̀ ní Ikeja", pickedForDay: "A yàn fún ọjọ́ rẹ", shopAllProducts: "Wo gbogbo ọjà", whyKlemStore: "Ìdí KlemStore", yourStoreFollows: "Ọjà rẹ̀ ń tẹ̀lé", yourLocation: "ibi tí o wà.", newInElectronics: "Ẹ̀rọ tuntun", shopElectronics: "Ra ẹ̀rọ ìmọ̀ ẹ̀rọ", localFavourites: "Àwọn àyànfẹ́ agbègbè", forToday: "fún òní.", shopFood: "Ra oúnjẹ àti ọjà", keepLifeMoving: "Jẹ́ kí ìgbésí ayé rìn", everydayEssentials: "Ohun pàtàkì ojoojúmọ́", shopEssentials: "Ra ohun pàtàkì", powerYourDay: "Fún ọjọ́ rẹ ní agbára", electronicsAccessories: "Ẹ̀rọ àti àwọn àfikún", department: "Ẹ̀ka", catalogue: "Àkójọ ọjà KlemStore", shopEverythingHeading: "Ra ohun gbogbo", shoppingFor: "O ń ra fún", products: "ọjà", sortBy: "Ṣètò nípa", featured: "Àwọn àyànfẹ́", departments: "Àwọn ẹ̀ka", localStock: "Ọjà tó wà nítòsí", clearSearch: "Pa ìwádìí rẹ́", noProductsFound: "A kò rí ọjà", addToBag: "Fi sínú àpò", addedToBag: "Ti fi sínú àpò" }),
  ig: translated({ localeName: "Igbo", language: "Asụsụ", home: "Ụlọ", shop: "Ahịa", electronics: "Ngwa elektrọnik", saved: "Echekwara", account: "Akaụntụ", bag: "Akpa", deliveringTo: "Na-ebuga na", change: "Gbanwee", localStockLive: "Ngwa dị n’ụlọ ahịa dị ndụ", shapingCatalogue: "Anyị na-ahazi katalọgụ gị dịka ebe ị nọ", seeWhatsClose: "Lee ihe dị nso →", storeServing: "Ụlọ ahịa na-eje ozi {location}", everythingFor: "Ihe niile maka", actualLife: "ndụ gị n’ezie.", heroDescription: "Nri ọhụrụ, ngwa elektrọnik na ihe ndị dị mkpa kwa ụbọchị sitere n’ụlọ ahịa kacha gị nso — anyị ga-ebuga ya mgbe ịchọrọ.", search: "Chọọ", searchPlaceholder: "Chọọ", shopEverything: "Zụta ihe niile", sameDayDelivery: "Nnyefe n’otu ụbọchị", liveLocalStock: "Ngwa dị n’ụlọ ahịa", secureCheckout: "Ịkwụ ụgwọ nchekwa", openNow: "Meghere ugbu a", closestStore: "KlemStore kacha nso", popularPicks: "Ihe ndị a na-ahọrọ nso gị", updatedItems: "Emelitere ugbu a · Ihe karịrị 120 dị", shopThisStore: "Zụta n’ụlọ ahịa a", browseDepartments: "Chọgharịa ngalaba", shopByDepartment: "Zụta site na ngalaba", viewAll: "Lee ha niile", popularNear: "Ihe a ma ama na Ikeja", pickedForDay: "Ahọpụtara maka gị", shopAllProducts: "Lee ngwaahịa niile", whyKlemStore: "Ihe kpatara KlemStore", yourStoreFollows: "Ụlọ ahịa gị na-eso", yourLocation: "ebe ị nọ.", newInElectronics: "Ngwa elektrọnik ọhụrụ", shopElectronics: "Zụta elektrọnik", localFavourites: "Ihe ndị obodo hụrụ n’anya", forToday: "maka taa.", shopFood: "Zụta nri na ngwa nri", keepLifeMoving: "Mee ka ndụ gaa n’ihu", everydayEssentials: "Ihe ndị dị mkpa kwa ụbọchị", shopEssentials: "Zụta ihe ndị dị mkpa", powerYourDay: "Mee ka ụbọchị gị nwee ike", electronicsAccessories: "Elektrọnik na ngwa mgbakwunye", department: "Ngalaba", catalogue: "Katalọgụ KlemStore", shopEverythingHeading: "Zụta ihe niile", shoppingFor: "Ị na-azụ maka", products: "ngwaahịa", sortBy: "Hazie site na", featured: "Ahọpụtara", departments: "Ngalaba", localStock: "Ngwa dị nso", clearSearch: "Hichapụ ọchụchọ", noProductsFound: "Ahụghị ngwaahịa", addToBag: "Tinye na akpa", addedToBag: "Etinyela na akpa" }),
  ha: translated({ localeName: "Hausa", language: "Harshe", home: "Gida", shop: "Kasuwa", electronics: "Kayan lantarki", saved: "Ajiye", account: "Asusu", bag: "Jaka", deliveringTo: "Ana kai wa", change: "Canza", localStockLive: "Kayayyakin kusa suna nan yanzu", shapingCatalogue: "Muna tsara kundin kayayyakin ku bisa wurin ku", seeWhatsClose: "Duba abin da yake kusa →", storeServing: "Muna hidima ga {location}", everythingFor: "Komai don", actualLife: "rayuwarka ta gaskiya.", heroDescription: "Sabon abinci, kayan lantarki da muhimman abubuwan yau da kullum daga shagon da ya fi kusa da ku — za mu kawo lokacin da kuke bukata.", search: "Nema", searchPlaceholder: "Nema", shopEverything: "Duba komai", sameDayDelivery: "Isarwa a rana guda", liveLocalStock: "Kayayyakin kusa suna nan", secureCheckout: "Biyan kudi cikin aminci", openNow: "A bude yanzu", closestStore: "KlemStore mafi kusa", popularPicks: "Abubuwan da aka fi so kusa da ku", updatedItems: "An sabunta yanzu · Abubuwa 120+ suna nan", shopThisStore: "Duba wannan shago", browseDepartments: "Duba sassa", shopByDepartment: "Saya bisa sashe", viewAll: "Duba duka", popularNear: "Abubuwan da suka shahara a Ikeja", pickedForDay: "An zaba muku", shopAllProducts: "Duba duk kayayyaki", whyKlemStore: "Dalilin KlemStore", yourStoreFollows: "Shagon ku yana bin", yourLocation: "wurin ku.", newInElectronics: "Sabbin kayan lantarki", shopElectronics: "Saya kayan lantarki", localFavourites: "Abubuwan da ake so a nan", forToday: "don yau.", shopFood: "Saya abinci da kayan masarufi", keepLifeMoving: "Sauƙaƙa rayuwa", everydayEssentials: "Muhimman abubuwan yau da kullum", shopEssentials: "Saya muhimman abubuwa", powerYourDay: "Ƙarfafa ranarka", electronicsAccessories: "Kayan lantarki da kayan haɗi", department: "Sashe", catalogue: "Kundin KlemStore", shopEverythingHeading: "Duba komai", shoppingFor: "Ana siyayya don", products: "kayayyaki", sortBy: "Tsara ta", featured: "Zaɓaɓɓu", departments: "Sassa", localStock: "Kayayyakin kusa", clearSearch: "Share nema", noProductsFound: "Ba a sami kaya ba", addToBag: "Saka a jaka", addedToBag: "An saka a jaka" }),
};

// Supplemental strings keep the catalogue dictionaries readable while ensuring
// the complete storefront shell does not silently fall back to English.
const localeSupplements: Partial<Record<Locale, Partial<TranslationDictionary>>> = {
  fr: {
    searchProducts: "Rechercher des produits, marques et essentiels",
    alwaysNearby: "Toujours près de vous", nearbyDescription: "Nous dirigeons votre panier vers le meilleur magasin pour votre adresse.",
    builtForToday: "Pensé pour aujourd'hui", stockDescription: "Les stocks et délais reflètent ce qui est réellement disponible.",
    simpleAllTheWay: "Simple du début à la fin", simpleDescription: "Un panier, un paiement, aucun changement de magasin déroutant.",
    usefulTech: "Technologie utile,", closeAtHand: "à portée de main.", techDescription: "Écouteurs, écrans, énergie et enceintes depuis votre magasin voisin.",
    goodThings: "De bonnes choses", foodDescription: "Aliments frais et essentiels choisis selon votre emplacement.",
    footerTagline: "Tout pour votre vie réelle.", footerDescription: "Alimentation, électronique et objets utiles pour votre quotidien.", footerShop: "Boutique", shopEverythingLink: "Tout découvrir", foodGroceries: "Alimentation", homeCare: "Maison et entretien", footerYourStore: "Votre KlemStore", yourAccount: "Votre compte", trackOrder: "Suivre une commande", savedProducts: "Produits favoris", helpContact: "Aide et contact", stayInLoop: "Restez au courant", newsletterDescription: "Nouveautés, offres utiles et nouvelles du magasin local. Sans bruit.", emailPlaceholder: "Votre adresse e-mail", localStockStatus: "Stock local en direct", servingLocations: "Ikeja et les environs", royalBlueShopping: "Le shopping bleu royal, où que vous soyez.", privacyTerms: "Confidentialité · Conditions", catalogueDescription: "De l'alimentation fraîche aux essentiels, à l'électronique et aux objets utiles pour la maison — depuis le magasin le plus proche.", availableFromStore: "Disponible dans le magasin le plus proche, avec stocks et délais mis à jour pour votre emplacement.", noProductsDescription: "Essayez un autre produit, une catégorie ou une marque. La recherche restera limitée à votre rayon actuel.",
  },
  zh: {
    searchProducts: "搜索商品、品牌和日常用品", alwaysNearby: "始终在您附近", nearbyDescription: "我们会将购物篮分配给最适合您地址的门店。", builtForToday: "为今天而生", stockDescription: "库存和配送时间反映真实可用情况。", simpleAllTheWay: "始终简单", simpleDescription: "一个购物袋、一次结账，不再困惑地切换门店。", usefulTech: "实用科技，", closeAtHand: "触手可得。", techDescription: "耳机、屏幕、电源和音箱，来自附近门店。", goodThings: "美好日常", foodDescription: "根据您的位置精选新鲜食品和日常主食。", footerTagline: "满足您真实生活的一切。", footerDescription: "食品、电子产品和适合日常生活的实用好物。", footerShop: "购物", shopEverythingLink: "浏览全部商品", foodGroceries: "食品杂货", homeCare: "家居护理", footerYourStore: "您的 KlemStore", yourAccount: "您的账户", trackOrder: "追踪订单", savedProducts: "收藏商品", helpContact: "帮助与联系", stayInLoop: "保持联系", newsletterDescription: "新品、优惠和本地门店动态，不打扰。", emailPlaceholder: "您的电子邮箱", localStockStatus: "本地库存实时", servingLocations: "服务 Ikeja 及周边地区", royalBlueShopping: "无论您在哪里，都能享受皇家蓝购物体验。", privacyTerms: "隐私 · 条款", catalogueDescription: "从新鲜食品、食品杂货到电子产品和家居好物，全部来自离您最近的门店。", availableFromStore: "来自服务您所在位置的最近门店，库存和配送时间实时更新。", noProductsDescription: "请尝试其他商品、类别或品牌。搜索范围仍限定在当前部门。",
  },
  yo: {
    searchProducts: "Wá ọjà, àmì àti ohun pàtàkì", alwaysNearby: "Ó wà nítòsí rẹ̀ nigbagbogbo", nearbyDescription: "A ń darí àpò rẹ̀ sí ọjà tó dára jù fún àdírẹ́sì rẹ.", builtForToday: "A ṣe é fún òní", stockDescription: "Ọjà tó wà àti àkókò fífiranṣẹ́ ń fi ohun tó wà gan-an hàn.", simpleAllTheWay: "Rọrùn láti ìbẹ̀rẹ̀ dé òpin", simpleDescription: "Àpò kan, ìsanwó kan, kò sí ìyípadà ọjà tó ń dá ọ lóró.", usefulTech: "Ẹ̀rọ tó wúlò,", closeAtHand: "tó sún mọ́ ọ.", techDescription: "Earbuds, ojú-iboju, agbára àti àwọn speaker láti ọjà tó wà nítòsí rẹ.", goodThings: "Àwọn ohun rere", foodDescription: "Oúnjẹ tuntun àti ohun pàtàkì tí a yan gẹ́gẹ́ bí ibi tí o wà.", footerTagline: "Ohun gbogbo fún ìgbésí ayé rẹ gidi.", footerDescription: "Oúnjẹ, ẹ̀rọ àti àwọn ohun tó wúlò fún bí o ṣe ń gbé ayé rẹ.", footerShop: "Ọjà", shopEverythingLink: "Ra ohun gbogbo", foodGroceries: "Oúnjẹ àti ọjà", homeCare: "Ilé àti ìtọ́jú", footerYourStore: "KlemStore rẹ", yourAccount: "Àkáǹtì rẹ", trackOrder: "Tẹ̀lé àṣẹ kan", savedProducts: "Ọjà tí a fipamọ́", helpContact: "Ìrànwọ́ àti ìbánisọ̀rọ̀", stayInLoop: "Máa mọ̀ ohun tó ń ṣẹlẹ̀", newsletterDescription: "Ohun tuntun, àǹfààní àti ìròyìn ọjà agbègbè. Kò sí ariwo.", emailPlaceholder: "Àdírẹ́sì imeeli rẹ", localStockStatus: "Ọjà tó wà nítòsí, lórí ayé", servingLocations: "A ń ṣiṣẹ́ ní Ikeja àti àgbègbè rẹ̀", royalBlueShopping: "Rírà aláwọ̀ buluu ọba, níbikíbi tí o bá wà.", privacyTerms: "Àṣírí · Àwọn òfin", catalogueDescription: "Láti oúnjẹ tuntun àti ọjà ilé dé ẹ̀rọ àti ohun tó wúlò fún ilé — láti ọjà tó sún mọ́ ọ jù.", availableFromStore: "Ó wà láti ọjà tó sún mọ́ ọ jù tí ń ṣiṣẹ́ fún ibi tí o wà, a sì máa ń ṣe àtúnṣe ọjà àti àkókò fífiranṣẹ́.", noProductsDescription: "Gbìyànjú orúkọ ọjà, ẹ̀ka tàbí àmì mìíràn. A ó fi ìwádìí sí ẹ̀ka tó wà lọ́wọ́.",
  },
  ig: {
    searchProducts: "Chọọ ngwaahịa, akara na ihe ndị dị mkpa", alwaysNearby: "Ọ na-adị gị nso mgbe niile", nearbyDescription: "Anyị na-eduga akpa gị n’ụlọ ahịa kacha mma maka adreesị gị.", builtForToday: "Emere maka taa", stockDescription: "Ngwa dị na ngwaahịa na oge nnyefe na-egosi ihe dị n’ezie.", simpleAllTheWay: "Dị mfe site na mmalite ruo ọgwụgwụ", simpleDescription: "Otu akpa, otu ịkwụ ụgwọ, enweghị mgbanwe ụlọ ahịa na-agbagwoju anya.", usefulTech: "Teknụzụ bara uru,", closeAtHand: "dị nso n’aka.", techDescription: "Earbuds, ihuenyo, ike na igwe okwu sitere n’ụlọ ahịa gị dị nso.", goodThings: "Ihe ọma", foodDescription: "Nri ọhụrụ na ihe ndị dị mkpa kwa ụbọchị ahọpụtara maka ebe ị nọ.", footerTagline: "Ihe niile maka ndụ gị n’ezie.", footerDescription: "Nri, ngwa elektrọnik na ihe bara uru maka ndụ ị na-ebi.", footerShop: "Ahịa", shopEverythingLink: "Zụta ihe niile", foodGroceries: "Nri na ngwa nri", homeCare: "Ụlọ na nlekọta", footerYourStore: "KlemStore gị", yourAccount: "Akaụntụ gị", trackOrder: "Soro iwu", savedProducts: "Ngwa echekwara", helpContact: "Enyemaka na kọntaktị", stayInLoop: "Nọgide na ozi", newsletterDescription: "Ngwa ọhụrụ, azụmahịa bara uru na ozi ụlọ ahịa obodo. Enweghị mkpọtụ.", emailPlaceholder: "Adreesị email gị", localStockStatus: "Ngwa dị nso, dị ndụ", servingLocations: "Na-eje ozi Ikeja na ebe dị nso", royalBlueShopping: "Ịzụ ahịa royal-blue, ebe ọ bụla ị nọ.", privacyTerms: "Nzuzo · Usoro", catalogueDescription: "Site na nri ọhụrụ na ngwa nri ruo ngwa elektrọnik na ihe bara uru maka ụlọ — site n’ụlọ ahịa kacha gị nso.", availableFromStore: "Ọ dị n’ụlọ ahịa kacha nso na-eje ozi ebe ị nọ, a na-emelite ngwaahịa na oge nnyefe.", noProductsDescription: "Gbalịa aha ngwaahịa, ngalaba ma ọ bụ akara ọzọ. Anyị ga-edobe ọchụchọ ahụ n’ime ngalaba gị ugbu a.",
  },
  ha: {
    searchProducts: "Nemo kaya, alamu da muhimman abubuwa", alwaysNearby: "Kusa da kai koyaushe", nearbyDescription: "Muna tura jakar ka zuwa shagon da ya fi dacewa da adireshin ka.", builtForToday: "An tsara shi don yau", stockDescription: "Kayayyaki da lokacin isarwa suna nuna abin da yake samuwa da gaske.", simpleAllTheWay: "Sauki daga farko zuwa karshe", simpleDescription: "Jaka daya, biyan kudi daya, babu rikicin canza shago.", usefulTech: "Fasaha mai amfani,", closeAtHand: "a kusa da kai.", techDescription: "Earbuds, allo, wuta da lasifika daga shagon da ke kusa da ku.", goodThings: "Abubuwa masu kyau", foodDescription: "Sabon abinci da muhimman kayayyaki da aka zaba bisa wurin ku.", footerTagline: "Komai don rayuwarka ta gaskiya.", footerDescription: "Abinci, kayan lantarki da abubuwa masu amfani ga rayuwarka.", footerShop: "Kasuwa", shopEverythingLink: "Duba komai", foodGroceries: "Abinci da kayan masarufi", homeCare: "Gida da kulawa", footerYourStore: "KlemStore naka", yourAccount: "Asusunka", trackOrder: "Bibiyi oda", savedProducts: "Kayayyakin da aka ajiye", helpContact: "Taimako da tuntuba", stayInLoop: "Kasance cikin sani", newsletterDescription: "Sabbin kaya, rangwame masu amfani da labaran shagon kusa. Babu hayaniya.", emailPlaceholder: "Adireshin imel dinka", localStockStatus: "Kayayyakin kusa, suna nan", servingLocations: "Muna hidima ga Ikeja da wuraren kusa", royalBlueShopping: "Siyayyar royal-blue, duk inda kake.", privacyTerms: "Sirri · Ka’idoji", catalogueDescription: "Daga sabon abinci da kayan masarufi zuwa kayan lantarki da abubuwan gida — daga shagon da ya fi kusa da ku.", availableFromStore: "Akwai daga shagon da ya fi kusa da ke hidima ga wurin ku, tare da sabunta kaya da lokacin isarwa.", noProductsDescription: "Gwada wani sunan kaya, sashe ko alama. Za mu ci gaba da bincike a sashen da kake ciki.",
  },
};

for (const locale of localeOptions) Object.assign(translations[locale.code], localeSupplements[locale.code]);

const localizedSectionDescriptions: Partial<Record<Locale, Partial<TranslationDictionary>>> = {
  fr: { essentialsDescription: "Les aliments, produits pour la maison et technologies fiables à portée de main.", electronicsDescription: "Une technologie utile, disponible localement et livrée depuis le magasin le plus proche." },
  zh: { essentialsDescription: "随手可得的可靠食品、家居用品和科技产品。", electronicsDescription: "实用科技，来自本地最近门店并可随时配送。" },
  yo: { essentialsDescription: "Oúnjẹ, ohun ilé àti ẹ̀rọ tó wúlò tí ó wà nítòsí rẹ.", electronicsDescription: "Ẹ̀rọ tó wúlò, tó wà ní agbègbè àti tí a lè fi ránṣẹ́ láti ọjà tó sún mọ́ ọ." },
  ig: { essentialsDescription: "Nri, ihe ụlọ na teknụzụ bara uru dị gị nso.", electronicsDescription: "Ngwa bara uru, dị n’obodo ma dị njikere maka nnyefe site n’ụlọ ahịa kacha nso." },
  ha: { essentialsDescription: "Abinci, kayan gida da fasaha mai amfani a kusa da ku.", electronicsDescription: "Fasaha mai amfani, tana nan a yankin kuma tana shirye don isarwa daga shagon da ya fi kusa." },
};

for (const locale of localeOptions) Object.assign(translations[locale.code], localizedSectionDescriptions[locale.code]);
for (const locale of localeOptions) if (locale.code !== "en") { Object.assign(translations[locale.code], uiTranslations[locale.code]); Object.assign(translations[locale.code], uiExtraTranslations[locale.code]); Object.assign(translations[locale.code], uiFlowTranslations[locale.code]); }

export function translate(locale: Locale, key: TranslationKey, values: Record<string, string> = {}) {
  let value = translations[locale][key] || translations.en[key];
  for (const [name, replacement] of Object.entries(values)) value = value.replace(`{${name}}`, replacement);
  return value;
}
