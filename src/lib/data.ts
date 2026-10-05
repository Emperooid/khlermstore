export type Product = {
  productId?: string;
  variantId?: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  emoji: string;
  image: string;
  tone: string;
  badge?: string;
  description: string;
  note: string;
};

export const categories = [
  { name: "Fresh produce", slug: "fresh-produce", emoji: "🍋", count: "180+" },
  { name: "Bakery & breakfast", slug: "bakery-breakfast", emoji: "🥐", count: "94" },
  { name: "Dairy & chilled", slug: "dairy-chilled", emoji: "🥛", count: "120" },
  { name: "Pantry staples", slug: "pantry-staples", emoji: "🫙", count: "240+" },
  { name: "Drinks", slug: "drinks", emoji: "🧃", count: "86" },
  { name: "Home & care", slug: "home-care", emoji: "🧺", count: "110" },
  { name: "Electronics", slug: "electronics", emoji: "📱", count: "160+" },
];

export const products: Product[] = [
  {
    slug: "sunrise-citrus-box",
    name: "Nigerian citrus box",
    category: "Fresh produce",
    price: 6800,
    unit: "box / 8 pieces",
    emoji: "🍊",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",
    tone: "orange",
    badge: "Picked today",
    description: "A bright box of Nigerian oranges, tangerines and lemons selected for breakfast, juicing and sharing.",
    note: "Sourced from local growers and delivered at its peak.",
  },
  {
    slug: "garden-crunch-lettuce",
    name: "Ugu leaf bundle",
    category: "Fresh produce",
    price: 2400,
    unit: "2 fresh bundles",
    emoji: "🥬",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",
    tone: "green",
    badge: "Just in",
    description: "Fresh, deep-green ugu leaves for soups, smoothies and everyday Nigerian cooking.",
    note: "Harvested locally and packed within 48 hours.",
  },
  {
    slug: "cloud-nine-sourdough",
    name: "Agege bread loaf",
    category: "Bakery & breakfast",
    price: 4500,
    unit: "650g loaf",
    emoji: "🍞",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",
    tone: "wheat",
    badge: "Baked this morning",
    description: "Soft, pillowy Agege-style bread with the golden crust made for akara, eggs and tea.",
    note: "Baked fresh by a neighbourhood bakery.",
  },
  {
    slug: "cream-top-greek-yoghurt",
    name: "Tiger-nut cultured yoghurt",
    category: "Dairy & chilled",
    price: 3200,
    unit: "450g tub",
    emoji: "🥣",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85",
    tone: "lilac",
    description: "Thick, cool and naturally tangy with a gentle tiger-nut finish for breakfast or a chilled snack.",
    note: "Made in small batches with no added sugar.",
  },
  {
    slug: "golden-hour-honey",
    name: "Ogbomoso wildflower honey",
    category: "Pantry staples",
    price: 5200,
    unit: "350ml jar",
    emoji: "🍯",
    image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=900&q=85",
    tone: "honey",
    badge: "Customer favourite",
    description: "Floral, amber honey with a soft finish from flowering groves in Ogbomoso. Lovely over toast or pap.",
    note: "Single-origin and gently filtered.",
  },
  {
    slug: "pink-guava-sparkler",
    name: "Chilled zobo blend",
    category: "Drinks",
    price: 2800,
    unit: "4 × 330ml bottles",
    emoji: "🩷",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",
    tone: "pink",
    badge: "New sip",
    description: "A bright hibiscus zobo blend with ginger, pineapple and a little lime. Best served very cold.",
    note: "Brewed locally with real fruit and spices.",
  },
  {
    slug: "market-day-avocado",
    name: "Market avocado pack",
    category: "Fresh produce",
    price: 3800,
    unit: "pack / 3 pieces",
    emoji: "🥑",
    image: "https://images.unsplash.com/photo-1523049673857-5a3e5b6b5c7a?auto=format&fit=crop&w=900&q=85",
    tone: "avocado",
    description: "Creamy, buttery avocados ready for peppered toast, salads, sandwiches and proper guacamole.",
    note: "Ripeness checked by hand before dispatch.",
  },
  {
    slug: "slow-sunday-pasta",
    name: "Jollof tomato base",
    category: "Pantry staples",
    price: 3900,
    unit: "500g pouch",
    emoji: "🍝",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85",
    tone: "tomato",
    description: "A rich tomato, pepper and onion base for quick jollof rice, stew, pasta and weeknight cooking.",
    note: "Blended locally with no artificial colour.",
  },
  {
    slug: "wildflower-table-bouquet",
    name: "Tropical market bouquet",
    category: "Home & care",
    price: 7600,
    unit: "1 seasonal bunch",
    emoji: "💐",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85",
    tone: "flower",
    badge: "Weekend mood",
    description: "A loose, colourful bunch of tropical stems to make the kitchen feel like it has plans.",
    note: "Seasonal stems will vary by local grower.",
  },
  {
    slug: "morning-roast-coffee",
    name: "Nigerian morning roast",
    category: "Bakery & breakfast",
    price: 6400,
    unit: "250g beans",
    emoji: "☕",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85",
    tone: "coffee",
    description: "Chocolatey, nutty and easy to love, roasted for bright mornings and slow weekend breakfasts.",
    note: "Roasted weekly in Lagos from Nigerian beans.",
  },
  {
    slug: "salted-caramel-granola",
    name: "Kunu crunch granola",
    category: "Bakery & breakfast",
    price: 5600,
    unit: "400g pouch",
    emoji: "🥜",
    image: "https://images.unsplash.com/photo-1517093728432-a0440f8d45af?auto=format&fit=crop&w=900&q=85",
    tone: "caramel",
    description: "Toasty oats, millet, roasted nuts and a gentle kunu-spice warmth for a proper breakfast crunch.",
    note: "Naturally sweetened and made locally.",
  },
  {
    slug: "soft-touch-dish-soap",
    name: "Lemongrass dish wash",
    category: "Home & care",
    price: 2900,
    unit: "500ml bottle",
    emoji: "🫧",
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=85",
    tone: "blue",
    description: "A gentle lemongrass-scented clean for everyday plates, pots and post-party evidence.",
    note: "Plant-based formula made in Nigeria.",
  },
  {
    slug: "soundpods-wireless-earbuds",
    name: "SoundPods wireless earbuds",
    category: "Electronics",
    price: 28500,
    unit: "1 pair",
    emoji: "🎧",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    tone: "blue",
    badge: "Tech favourite",
    description: "Compact wireless earbuds with clear calls, a comfortable fit and a charging case for your daily commute.",
    note: "Fast local delivery and easy returns.",
  },
  {
    slug: "klemview-smart-television",
    name: "KlemView smart television",
    category: "Electronics",
    price: 389000,
    unit: "43-inch 4K TV",
    emoji: "📺",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=85",
    tone: "blue",
    badge: "New arrival",
    description: "A crisp 4K smart screen for football nights, family films and everything you stream after work.",
    note: "Warranty included. Delivery scheduling available.",
  },
  {
    slug: "swiftcharge-power-bank",
    name: "SwiftCharge power bank",
    category: "Electronics",
    price: 32000,
    unit: "20,000mAh",
    emoji: "🔋",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=85",
    tone: "blue",
    badge: "Everyday essential",
    description: "Reliable portable power with two USB outputs for busy days, travel and unpredictable power cuts.",
    note: "Tested before dispatch.",
  },
  {
    slug: "pocket-bluetooth-speaker",
    name: "Pocket Bluetooth speaker",
    category: "Electronics",
    price: 46500,
    unit: "1 speaker",
    emoji: "🔊",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
    tone: "blue",
    description: "Room-filling sound in a compact speaker with a durable finish for kitchens, balconies and weekends away.",
    note: "Up to 12 hours of playback.",
  },
];

export const featuredProducts = [products[0], products[2], products[5], products[12], products[13], products[14]];

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);

export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);

export const categoryProducts = (slug: string) => {
  const category = getCategory(slug);
  return category ? products.filter((product) => product.category === category.name) : products;
};
