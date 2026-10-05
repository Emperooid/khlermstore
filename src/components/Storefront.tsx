"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  categoryProducts,
  categories,
  featuredProducts,
  formatNaira,
  getCategory,
  getProduct,
  products,
  type Product,
} from "../lib/data";
import { localeOptions, translate, type TranslationKey } from "../lib/i18n";
import { contextReplaced } from "../lib/features/context/contextSlice";
import { languageChanged } from "../lib/features/locale/localeSlice";
import {
  cartCleared,
  itemAdded,
  itemRemoved,
  quantityChanged,
  selectCartCount,
  selectCartLines,
  selectCartTotal,
} from "../lib/features/cart/cartSlice";
import { savedToggled } from "../lib/features/saved/savedSlice";
import type { RootState } from "../lib/store";
import { addCartItem, catalogItemToProduct, createCart, createCheckoutQuote, isCoreApiConfigured, listCatalog, resolveFulfillmentContext } from "../lib/coreApi";
import { catalogFailed, catalogLoaded, catalogLoading, remoteCartCleared, remoteCartOpened } from "../lib/features/catalog/catalogSlice";

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/electronics", label: "Electronics" },
  { href: "/favorites", label: "Saved" },
];

const deliverySlots = [
  { time: "Today, 5–7 PM", note: "The little luxuries slot", price: 1200 },
  { time: "Tomorrow, 9–11 AM", note: "Freshest start to the day", price: 800 },
  { time: "Tomorrow, 3–5 PM", note: "Easy after-work drop", price: 600 },
];

const locationCoordinates: Record<string, [number, number]> = {
  "Ikeja, Lagos": [6.6018, 3.3515],
  "Yaba, Lagos": [6.5095, 3.3711],
  "Victoria Island, Lagos": [6.4281, 3.4219],
};

function useLocaleCopy() {
  const locale = useSelector((state: RootState) => state.locale.language);
  return { locale, t: (key: TranslationKey, values?: Record<string, string>) => translate(locale, key, values) };
}

function useActiveProducts() {
  const remoteProducts = useSelector((state: RootState) => state.catalog.items);
  return remoteProducts?.length ? remoteProducts : products;
}

function CoreApiBridge() {
  const dispatch = useDispatch();
  const context = useSelector((state: RootState) => state.context.current);
  const remoteCartId = useSelector((state: RootState) => state.catalog.remoteCartId);
  const contextId = context?.id || "";
  const validContextId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(contextId);

  useEffect(() => {
    if (!isCoreApiConfigured() || !validContextId) return;
    let cancelled = false;
    dispatch(catalogLoading(contextId));
    void listCatalog(contextId).then((items) => {
      if (!cancelled) dispatch(catalogLoaded({ contextId, items: items.map(catalogItemToProduct) }));
    }).catch((error: unknown) => {
      if (!cancelled) dispatch(catalogFailed(error instanceof Error ? error.message : "Catalog unavailable"));
    });
    return () => { cancelled = true; };
  }, [contextId, dispatch, validContextId]);

  useEffect(() => {
    if (!isCoreApiConfigured() || !validContextId || remoteCartId) return;
    void createCart(contextId, context?.currency || "NGN").then((cart) => dispatch(remoteCartOpened(cart.cartId))).catch(() => undefined);
  }, [context?.currency, contextId, dispatch, remoteCartId, validContextId]);

  return null;
}

function LanguageSwitcher() {
  const dispatch = useDispatch();
  const locale = useSelector((state: RootState) => state.locale.language);

  useEffect(() => {
    document.documentElement.lang = locale;
    let saved: string | null = null;
    try {
      saved = window.localStorage?.getItem("klemstore-language") || null;
    } catch {
      saved = null;
    }
    if (!saved && typeof document.cookie === "string") saved = document.cookie.split("; ").find((cookie) => cookie.startsWith("klemstore-language="))?.split("=")[1] || null;
    if (localeOptions.some((option) => option.code === saved) && saved !== locale) dispatch(languageChanged(saved as typeof locale));
  }, [dispatch, locale]);

  return <label className="language-switcher"><span>文A</span><select value={locale} onChange={(event) => { const next = event.target.value as typeof locale; dispatch(languageChanged(next)); try { window.localStorage?.setItem("klemstore-language", next); } catch { /* Use the cookie fallback below in restricted webviews. */ } document.cookie = `klemstore-language=${next}; path=/; max-age=31536000; SameSite=Lax`; }} aria-label="Choose language">{localeOptions.map((option) => <option value={option.code} key={option.code}>{option.nativeLabel}</option>)}</select></label>;
}

export function PageShell({ children }: { children: ReactNode }) {
  const { t } = useLocaleCopy();
  return (
    <div className="site-frame">
      <CoreApiBridge />
      <SiteHeader />
      <div className="context-strip">
        <div className="page-width context-strip-inner">
          <span className="live-dot" />
          <span>{t("localStockLive")}</span>
          <span className="context-divider" />
          <span>{t("shapingCatalogue")}</span>
          <Link href="/shop" className="context-link">{t("seeWhatsClose")}</Link>
        </div>
      </div>
      {children}
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const { t } = useLocaleCopy();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartCount = useSelector((state: RootState) => selectCartCount(state));
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const activeLocation = useSelector((state: RootState) => state.context.current?.displayLabel);

  const applyLocation = async () => {
    const label = locationInput.trim() || "Ikeja, Lagos";
    const [latitude, longitude] = locationCoordinates[label] || locationCoordinates["Ikeja, Lagos"];
    dispatch(remoteCartCleared());
    if (isCoreApiConfigured()) {
      try {
        const resolved = await resolveFulfillmentContext(latitude, longitude);
        if (resolved.outcome === "SELECTED" && resolved.contextId) {
          dispatch(contextReplaced({ id: resolved.contextId, displayLabel: resolved.displayLabel || label, deliveryFeeMinor: 0, currency: resolved.currency || "NGN", expiresAt: resolved.expiresAt }));
          setLocationOpen(false);
          setLocationInput("");
          return;
        }
      } catch {
        // Keep the local experience usable while a developer is running without the API.
      }
    }
    dispatch(
      contextReplaced({
        id: `ctx-${Date.now()}`,
        displayLabel: label,
        deliveryFeeMinor: 800,
        currency: "NGN",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }),
    );
    setLocationOpen(false);
    setLocationInput("");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    setSearchOpen(false);
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <>
      <header className="site-header">
        <div className="page-width header-row">
          <Link href="/" className="brand" aria-label="KlemStore home">
            <img src="/klemstore-logo.png" alt="KlemStore" className="brand-image" />
          </Link>

          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? "nav-link active" : "nav-link"}>
                {item.href === "/shop" ? t("shop") : item.href === "/favorites" ? t("saved") : t("electronics")}
              </Link>
            ))}
          </nav>

          <form className="header-search" action="/shop">
            <span>⌕</span><input name="q" placeholder={t("searchProducts")} aria-label={t("searchProducts")} /><button type="submit" aria-label={t("search")}>↵</button>
          </form>

          <div className="header-actions">
            <LanguageSwitcher />
            <button className="location-pill" onClick={() => setLocationOpen(true)} aria-label={`${t("change")} ${t("deliveringTo").toLowerCase()}`}>
              <span className="pin-icon">⌖</span>
              <span className="location-copy"><small>{t("deliveringTo")}</small><strong>{activeLocation || "Ikeja, Lagos"}</strong></span>
              <span className="chevron">⌄</span>
            </button>
            <button className="icon-button search-button" onClick={() => setSearchOpen(true)} aria-label={t("search")}>⌕</button>
            <Link href="/account" className="icon-button account-button" aria-label={t("yourAccount")}>◌</Link>
            <Link href="/cart" className="cart-button" aria-label={`${t("bag")} · ${cartCount}`}>
              <span>{t("bag")}</span><b>{cartCount.toString().padStart(2, "0")}</b>
            </Link>
          </div>
        </div>
        <div className="header-department-bar">
          <div className="page-width header-department-inner"><span className="header-department-label">{t("shopByDepartment")}</span>{categories.map((category) => <Link href={`/shop/${category.slug}`} key={category.slug} className="header-department-link"><span>{category.emoji}</span>{category.name}</Link>)}<Link href="/shop" className="header-department-link all-departments">{t("viewAll")} <b>→</b></Link></div>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/" className={pathname === "/" ? "mobile-nav-link selected" : "mobile-nav-link"}><span>⌂</span>{t("home")}</Link>
          <Link href="/shop" className={pathname.startsWith("/shop") ? "mobile-nav-link selected" : "mobile-nav-link"}><span>⌕</span>{t("shop")}</Link>
          <Link href="/favorites" className={pathname.startsWith("/favorites") ? "mobile-nav-link selected" : "mobile-nav-link"}><span>♡</span>{t("saved")}</Link>
          <Link href="/account" className={pathname.startsWith("/account") ? "mobile-nav-link selected" : "mobile-nav-link"}><span>◌</span>{t("account")}</Link>
          <Link href="/cart" className={pathname.startsWith("/cart") ? "mobile-nav-link selected" : "mobile-nav-link"}><span>▱</span>{t("bag")} <em>{cartCount}</em></Link>
        </nav>
      </header>

      {locationOpen && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Choose delivery location">
          <button className="overlay-scrim" onClick={() => setLocationOpen(false)} aria-label="Close location picker" />
          <div className="location-sheet">
            <div className="sheet-handle" />
            <button className="close-button" onClick={() => setLocationOpen(false)} aria-label="Close">×</button>
            <span className="section-kicker">{t("deliveringTo")}</span>
            <h2>Where should we<br /><em>drop the good stuff?</em></h2>
            <p className="muted-copy">We&apos;ll quietly tune your catalogue, availability and delivery promise to the store closest to you.</p>
            <label className="field-label" htmlFor="location">{t("deliveringTo")}</label>
            <div className="input-with-icon"><span>⌖</span><input id="location" autoFocus value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="Search an address or neighbourhood" /></div>
            <div className="location-suggestions">
              {['Ikeja, Lagos', 'Yaba, Lagos', 'Victoria Island, Lagos'].map((suggestion) => (
                <button key={suggestion} onClick={() => setLocationInput(suggestion)}><span>⌖</span>{suggestion}<b>›</b></button>
              ))}
            </div>
            <button className="primary-button full-button" onClick={applyLocation}>{t("change")} <span>→</span></button>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="overlay search-overlay" role="dialog" aria-modal="true" aria-label="Search KlemStore">
          <button className="overlay-scrim" onClick={() => setSearchOpen(false)} aria-label="Close search" />
          <div className="search-sheet">
            <button className="close-button" onClick={() => setSearchOpen(false)} aria-label="Close">×</button>
            <span className="section-kicker">{t("search")}</span>
            <h2>What are you<br /><em>in the mood for?</em></h2>
            <form className="search-field" onSubmit={submitSearch}><span>⌕</span><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t("searchProducts")} aria-label={t("searchProducts")} /><button type="submit" aria-label={t("search")}>→</button></form>
            <div className="search-suggestions"><span>Popular now</span><Link href="/shop/fresh-produce" onClick={() => setSearchOpen(false)}>Crisp & green</Link><Link href="/shop/bakery-breakfast" onClick={() => setSearchOpen(false)}>Slow mornings</Link><Link href="/shop/drinks" onClick={() => setSearchOpen(false)}>Something fizzy</Link></div>
          </div>
        </div>
      )}
    </>
  );
}

function SiteFooter() {
  const { t } = useLocaleCopy();
  return (
    <footer className="site-footer">
      <div className="page-width footer-topline"><div className="footer-brand-lockup"><span className="footer-mark">✦</span><div><strong>KlemStore</strong><span>{t("footerTagline")}</span></div></div><div className="footer-service-badge"><span className="live-dot" /><span><strong>{t("localStockStatus")}</strong><small>{t("servingLocations")}</small></span></div><LanguageSwitcher /></div>
      <div className="page-width footer-grid">
        <div className="footer-brand"><h2>Everyday shopping,<br /><em>with better energy.</em></h2><p>{t("footerDescription")}</p></div>
        <div className="footer-links"><span className="footer-heading">{t("footerShop")}</span><Link href="/shop">{t("shopEverythingLink")}</Link><Link href="/shop/fresh-produce">{t("foodGroceries")}</Link><Link href="/shop/electronics">{t("electronics")}</Link><Link href="/shop/home-care">{t("homeCare")}</Link></div>
        <div className="footer-links"><span className="footer-heading">{t("footerYourStore")}</span><Link href="/account">{t("yourAccount")}</Link><Link href="/orders">{t("trackOrder")}</Link><Link href="/favorites">{t("savedProducts")}</Link><Link href="/help">{t("helpContact")}</Link></div>
        <div className="footer-newsletter"><span className="footer-heading">{t("stayInLoop")}</span><p>{t("newsletterDescription")}</p><div className="newsletter-input"><input placeholder={t("emailPlaceholder")} aria-label={t("emailPlaceholder")} /><button aria-label="Subscribe">→</button></div></div>
      </div>
      <div className="page-width footer-bottom"><span>© 2026 KlemStore</span><span>{t("royalBlueShopping")}</span><span>{t("privacyTerms")}</span></div>
    </footer>
  );
}

function ProductArt({ product, large = false }: { product: Product; large?: boolean }) {
  return <div className={`product-art art-${product.tone} ${large ? "art-large" : ""}`}>
    <img src={product.image} alt="" loading={large ? "eager" : "lazy"} onError={(event) => { event.currentTarget.style.display = "none"; }} />
    <span className="product-fallback-emoji" aria-hidden="true">{product.emoji}</span>
    <i>{product.badge || ""}</i>
  </div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLocaleCopy();
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const saved = useSelector((state: RootState) => state.saved.slugs.includes(product.slug));
  const remoteCartId = useSelector((state: RootState) => state.catalog.remoteCartId);

  const add = () => {
    dispatch(itemAdded(product));
    if (remoteCartId && product.variantId) void addCartItem(remoteCartId, product.variantId).catch(() => undefined);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  };

  return (
    <article className="product-card">
      <div className="product-card-top"><Link href={`/product/${product.slug}`}><ProductArt product={product} /></Link><button className={saved ? "save-button saved" : "save-button"} onClick={() => dispatch(savedToggled(product.slug))} aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}>{saved ? "♥" : "♡"}</button>{product.badge && <span className="product-badge">{product.badge}</span>}</div>
      <div className="product-card-info"><div><span className="product-category">{product.category}</span><Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link><span className="product-unit">{product.unit}</span></div><strong className="product-price">{formatNaira(product.price)}</strong></div>
      <button className={added ? "add-button added" : "add-button"} onClick={add}><span>{added ? t("addedToBag") : t("addToBag")}</span><b>{added ? "✓" : "+"}</b></button>
    </article>
  );
}

function ProductGrid({ items, title }: { items: Product[]; title?: string }) {
  return <div className="product-grid">{items.map((product) => <ProductCard key={product.slug} product={product} />)}</div>;
}

function SectionTitle({ kicker, title, copy, href, linkLabel = "See everything" }: { kicker: string; title: string; copy?: string; href?: string; linkLabel?: string }) {
  return <div className="section-title"><div><span className="section-kicker">{kicker}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{href && <Link href={href} className="text-link">{linkLabel} <span>↗</span></Link>}</div>;
}

const homeDepartments = [
  { ...categories[0], image: products[0].image },
  { ...categories[1], image: products[2].image },
  { ...categories[2], image: products[3].image },
  { ...categories[3], image: products[7].image },
  { ...categories[4], image: products[5].image },
  { ...categories[5], image: products[8].image },
  { ...categories[6], image: products[12].image },
];

function HomeHero() {
  const { t } = useLocaleCopy();
  const activeLocation = useSelector((state: RootState) => state.context.current?.displayLabel || "Ikeja, Lagos");

  return <section className="commerce-hero">
    <div className="page-width commerce-hero-inner">
      <div className="commerce-hero-copy">
        <span className="hero-location-chip"><span className="live-dot" /> {t("storeServing", { location: activeLocation })}</span>
        <h1>{t("everythingFor")} <span>{t("actualLife")}</span></h1>
        <p>{t("heroDescription")}</p>
        <button className="hero-location-control" type="button" onClick={() => document.querySelector<HTMLButtonElement>(".location-pill")?.click()}><span className="hero-location-icon">⌖</span><span><small>{t("deliveringTo")}</small><strong>{activeLocation}</strong></span><b>{t("change")}</b><i>⌄</i></button>
        <form className="home-search" action="/shop"><span>⌕</span><input name="q" placeholder={t("searchProducts")} aria-label={t("searchProducts")} /><button type="submit">{t("search")}</button></form>
        <div className="commerce-hero-actions"><Link href="/shop" className="primary-button">{t("shopEverything")} <span>→</span></Link></div>
        <div className="commerce-trust"><span>✓ {t("sameDayDelivery")}</span><span>✓ {t("liveLocalStock")}</span><span>✓ {t("secureCheckout")}</span></div>
      </div>
      <div className="hero-store-card">
        <div className="hero-store-heading"><div><span className="store-status"><i /> {t("openNow")}</span><strong>{t("closestStore")}</strong><small>Allen Avenue · 2.4 km away</small></div><span className="hero-store-pin">⌖</span></div>
        <div className="hero-store-image"><img src={products[0].image} alt="Popular products available nearby" /></div>
        <div className="hero-store-caption"><strong>{t("popularPicks")}</strong><span>{t("updatedItems")}</span></div>
        <div className="hero-mini-products">{featuredProducts.slice(0, 3).map((product) => <Link key={product.slug} href={`/product/${product.slug}`}><img src={product.image} alt="" /><span>{product.name}</span><b>{formatNaira(product.price)}</b></Link>)}</div>
        <Link href="/shop" className="hero-store-link">{t("shopThisStore")} <span>→</span></Link>
      </div>
    </div>
  </section>;
}

function HomeDepartments() {
  const { t } = useLocaleCopy();
  return <section className="departments-section page-width"><div className="commerce-section-heading"><div><span className="section-kicker">{t("browseDepartments")}</span><h2>{t("shopByDepartment")}</h2></div><Link href="/shop" className="text-link">{t("viewAll")} <span>↗</span></Link></div><div className="department-grid">{homeDepartments.map((department) => <Link href={`/shop/${department.slug}`} key={department.slug} className="department-card"><div className="department-image"><img src={department.image} alt="" /><span>{department.emoji}</span></div><strong>{department.name}</strong><small>{department.count} items <span>→</span></small></Link>)}</div></section>;
}

function HomeProductSection({ kicker, title, copy, href, linkLabel, items }: { kicker: string; title: string; copy: string; href: string; linkLabel: string; items: Product[] }) {
  return <section className="home-products-section page-width"><SectionTitle kicker={kicker} title={title} copy={copy} href={href} linkLabel={linkLabel} /><ProductGrid items={items} /></section>;
}

function HomePromise() {
  const { t } = useLocaleCopy();
  return <section className="brand-promise"><div className="page-width brand-promise-inner"><div><span className="section-kicker light">{t("whyKlemStore")}</span><h2>{t("yourStoreFollows")}<br /><em>{t("yourLocation")}</em></h2></div><div className="promise-points"><div><b>⌖</b><span><strong>{t("alwaysNearby")}</strong><small>{t("nearbyDescription")}</small></span></div><div><b>◷</b><span><strong>{t("builtForToday")}</strong><small>{t("stockDescription")}</small></span></div><div><b>✓</b><span><strong>{t("simpleAllTheWay")}</strong><small>{t("simpleDescription")}</small></span></div></div></div></section>;
}

function HomePromoGrid() {
  const { t } = useLocaleCopy();
  return <section className="home-promo-section page-width"><Link href="/shop/electronics" className="home-promo-card promo-tech"><div><span className="section-kicker">{t("newInElectronics")}</span><h3>{t("usefulTech")}<br /><em>{t("closeAtHand")}</em></h3><p>{t("techDescription")}</p><span className="promo-link">{t("shopElectronics")} <b>→</b></span></div><div className="promo-product-stack"><img src={products[13].image} alt="" /><img src={products[12].image} alt="" /></div></Link><Link href="/shop/fresh-produce" className="home-promo-card promo-local"><div><span className="section-kicker">{t("localFavourites")}</span><h3>{t("goodThings")}<br /><em>{t("forToday")}</em></h3><p>{t("foodDescription")}</p><span className="promo-link">{t("shopFood")} <b>→</b></span></div><div className="promo-product-stack"><img src={products[0].image} alt="" /><img src={products[5].image} alt="" /></div></Link></section>;
}

export function HomePage() {
  const { t } = useLocaleCopy();
  const activeProducts = useActiveProducts();
  return <main className="commerce-home"><HomeHero /><HomeDepartments /><HomeProductSection kicker={t("popularNear")} title={t("pickedForDay")} copy={t("featuredDescription")} href="/shop" linkLabel={t("shopAllProducts")} items={activeProducts.slice(0, 6)} /><HomePromise /><HomePromoGrid /><HomeProductSection kicker={t("keepLifeMoving")} title={t("everydayEssentials")} copy={t("essentialsDescription")} href="/shop" linkLabel={t("shopEssentials")} items={activeProducts.slice(6, 12)} /><HomeProductSection kicker={t("powerYourDay")} title={t("electronicsAccessories")} copy={t("electronicsDescription")} href="/shop/electronics" linkLabel={t("shopElectronics")} items={activeProducts.slice(12)} /></main>;
}

export function ShopPage({ category, initialQuery = "" }: { category?: string; initialQuery?: string }) {
  const { t } = useLocaleCopy();
  const router = useRouter();
  const searchQuery = initialQuery.trim();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [filter, setFilter] = useState("All picks");
  const [sort, setSort] = useState("Featured");
  const activeProducts = useActiveProducts();
  const categoryInfo = category ? getCategory(category) : undefined;
  const source = category ? activeProducts.filter((product) => product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") === category || product.category === categoryInfo?.name) : activeProducts;
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);
  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    const searched = normalizedQuery
      ? source.filter((product) => [product.name, product.category, product.unit, product.description, product.note].some((value) => value.toLowerCase().includes(normalizedQuery)))
      : source;
    const next = filter === "All picks" ? searched : searched.filter((product) => product.category === filter);
    if (sort === "Price: low to high") return [...next].sort((a, b) => a.price - b.price);
    if (sort === "Price: high to low") return [...next].sort((a, b) => b.price - a.price);
    return next;
  }, [filter, searchQuery, sort, source]);
  const filterOptions = category ? ["All picks"] : ["All picks", ...categories.map((item) => item.name)];
  const basePath = category ? `/shop/${category}` : "/shop";
  const submitCatalogueSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    router.push(query ? `${basePath}?q=${encodeURIComponent(query)}` : basePath);
  };

  return <main className="page-width shop-page"><div className="shop-hero"><div><span className="section-kicker">{categoryInfo?.emoji || "✦"} {categoryInfo ? t("department") : t("catalogue")}</span><h1>{categoryInfo?.name || t("shopEverythingHeading")}</h1><p>{categoryInfo ? t("availableFromStore") : t("catalogueDescription")}</p></div><div className="shop-location-card"><span className="live-dot" /><div><small>{t("shoppingFor")}</small><strong>Ikeja, Lagos</strong></div><button type="button">{t("change")}</button></div></div><form className="catalogue-search" onSubmit={submitCatalogueSearch}><span>⌕</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={categoryInfo ? `${t("search")} ${categoryInfo.name.toLowerCase()}` : t("searchProducts")} aria-label={t("search")} />{searchInput && <button type="button" className="clear-search" onClick={() => { setSearchInput(""); router.push(basePath); }} aria-label={t("clearSearch")}>×</button>}<button type="submit" className="catalogue-search-submit">{t("search")}</button></form>{searchQuery && <div className="search-result-summary"><span>{t("searchResultsFor")} <strong>&ldquo;{searchQuery}&rdquo;</strong></span><Link href={basePath}>{t("clearSearch")}</Link></div>}<div className="shop-toolbar"><div className="filter-row">{filterOptions.map((option) => <button key={option} className={filter === option ? "filter-chip selected" : "filter-chip"} onClick={() => setFilter(option)}>{option === "All picks" ? t("featured") : option}</button>)}</div><div className="shop-toolbar-right"><span className="result-count">{filtered.length} {t("products")}</span><label className="sort-select">{t("sortBy")} <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="Featured">{t("featured")}</option><option value="Price: low to high">{t("lowToHigh")}</option><option value="Price: high to low">{t("highToLow")}</option></select><span>⌄</span></label></div></div><div className="shop-content"><aside className="shop-sidebar"><strong>{t("departments")}</strong>{categories.map((item) => <Link href={`/shop/${item.slug}`} key={item.slug} className={category === item.slug ? "sidebar-link selected" : "sidebar-link"}><span>{item.emoji}</span>{item.name}<small>{item.count}</small></Link>)}<div className="sidebar-note"><b>⌖</b><strong>{t("localStock")}</strong><span>{t("localStockDescription")}</span></div></aside>{filtered.length ? <ProductGrid items={filtered} /> : <div className="empty-search"><span>⌕</span><h2>{t("noProductsFound")}</h2><p>{t("noProductsDescription")}</p><Link href={basePath} className="primary-button">{t("clearSearch")} <span>→</span></Link></div>}</div></main>;
}

export function ProductPage({ slug }: { slug: string }) {
  const activeProducts = useActiveProducts();
  const product = activeProducts.find((item) => item.slug === slug) || getProduct(slug);
  const dispatch = useDispatch();
  const remoteCartId = useSelector((state: RootState) => state.catalog.remoteCartId);
  const [quantity, setQuantity] = useState(1);
  if (!product) return <main className="page-width empty-page"><span className="empty-emoji">🧺</span><h1>That shelf is empty.</h1><p>We couldn&apos;t find this one, but there&apos;s plenty more good stuff nearby.</p><Link href="/shop" className="primary-button">Back to shop <span>→</span></Link></main>;
  return <main className="page-width product-page"><Link href="/shop" className="back-link">← Back to everything</Link><div className="product-detail"><div className="product-detail-art"><ProductArt product={product} large /><span className="detail-scribble">picked<br />near you ✦</span></div><div className="product-detail-copy"><span className="section-kicker">{product.category}</span><h1>{product.name}</h1><p className="product-detail-note">{product.note}</p><strong className="detail-price">{formatNaira(product.price)} <small>/ {product.unit}</small></strong><p className="detail-description">{product.description}</p><div className="detail-divider" /><div className="detail-meta"><span><b>↯</b> In stock near you</span><span><b>◷</b> Delivery from 60 mins</span><span><b>✦</b> Freshness checked</span></div><div className="detail-actions"><div className="quantity-picker"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}>+</button></div><button className="primary-button add-detail" onClick={() => { for (let index = 0; index < quantity; index += 1) { dispatch(itemAdded(product)); if (remoteCartId && product.variantId) void addCartItem(remoteCartId, product.variantId); } }}>Add {quantity > 1 ? `${quantity} to` : "to"} bag <span>→</span></button></div><Link href="/help" className="delivery-note">Not sure if you&apos;ll love it? Our team has opinions <span>↗</span></Link></div></div><section className="related-section"><SectionTitle kicker="You might also like" title="Good company for this one" /><ProductGrid items={activeProducts.filter((item) => item.slug !== product.slug).slice(0, 4)} /></section></main>;
}

export function CartPage() {
  const dispatch = useDispatch();
  const lines = useSelector((state: RootState) => selectCartLines(state));
  const subtotal = useSelector((state: RootState) => selectCartTotal(state));
  const delivery = subtotal > 15000 || subtotal === 0 ? 0 : 800;
  return <main className="page-width cart-page"><div className="cart-heading"><div><span className="section-kicker">Your little haul</span><h1>The bag</h1></div><span className="cart-count-label">{lines.length} {lines.length === 1 ? "kind" : "kinds"} of good things</span></div>{lines.length === 0 ? <div className="empty-cart"><div className="empty-basket">🧺</div><h2>A little light in here.</h2><p>Your bag is waiting for a few bright ideas.</p><Link href="/shop" className="primary-button">Fill it with good stuff <span>→</span></Link></div> : <div className="cart-layout"><div className="cart-lines"><div className="cart-line-header"><span>What you picked</span><span>Quantity</span><span>Total</span></div>{lines.map((line) => <div className="cart-line" key={line.slug}><div className={`cart-line-art art-${line.tone}`}><span>{line.emoji}</span></div><div className="cart-line-name"><Link href={`/product/${line.slug}`}>{line.name}</Link><span>{line.unit}</span></div><div className="quantity-picker"><button onClick={() => dispatch(quantityChanged({ slug: line.slug, quantity: line.quantity - 1 }))}>−</button><span>{line.quantity}</span><button onClick={() => dispatch(quantityChanged({ slug: line.slug, quantity: line.quantity + 1 }))}>+</button></div><strong>{formatNaira(line.price * line.quantity)}</strong><button className="remove-line" onClick={() => dispatch(itemRemoved(line.slug))} aria-label={`Remove ${line.name}`}>×</button></div>)}<Link href="/shop" className="continue-link">← Keep exploring</Link></div><aside className="summary-card"><span className="section-kicker">The little maths</span><h2>Almost there.</h2><div className="summary-row"><span>Good stuff</span><strong>{formatNaira(subtotal)}</strong></div><div className="summary-row"><span>Delivery</span><strong>{delivery === 0 ? "Free" : formatNaira(delivery)}</strong></div><p className="free-delivery-note">{subtotal >= 15000 ? "You unlocked free delivery ✦" : `Add ${formatNaira(15000 - subtotal)} more for free delivery`}</p><div className="summary-total"><span>Total</span><strong>{formatNaira(subtotal + delivery)}</strong></div><Link href="/checkout" className="primary-button full-button">Choose delivery <span>→</span></Link><span className="secure-note">⌁ Secure checkout · No supermarket drama</span></aside></div>}</main>;
}

export function CheckoutPage() {
  const dispatch = useDispatch();
  const subtotal = useSelector((state: RootState) => selectCartTotal(state));
  const lines = useSelector((state: RootState) => selectCartLines(state));
  const remoteCartId = useSelector((state: RootState) => state.catalog.remoteCartId);
  const [placed, setPlaced] = useState(false);
  const [slot, setSlot] = useState(1);
  const [quoteError, setQuoteError] = useState("");
  if (placed) return <main className="page-width success-page"><div className="success-orbit"><span>✦</span></div><span className="section-kicker">It&apos;s on its way</span><h1>Order received.<br /><em>Good choice.</em></h1><p>Your KlemStore run is confirmed and your nearby store is already getting things together.</p><div className="order-number">ORDER KS–{Math.floor(Date.now() / 1000).toString().slice(-6)}</div><Link href="/orders" className="primary-button">Track your order <span>→</span></Link></main>;
  const delivery = deliverySlots[slot].price;
  const placeOrder = async () => { setQuoteError(""); if (remoteCartId) { try { await createCheckoutQuote(remoteCartId); } catch { setQuoteError("The live checkout quote is unavailable, so your order was not submitted."); return; } } setPlaced(true); dispatch(cartCleared()); dispatch(remoteCartCleared()); };
  return <main className="page-width checkout-page"><Link href="/cart" className="back-link">← Back to bag</Link><div className="checkout-heading"><span className="section-kicker">The final lovely bit</span><h1>Let&apos;s get this<br /><em>to your door.</em></h1></div><div className="checkout-layout"><div className="checkout-form"><section className="checkout-section"><div className="checkout-section-heading"><span>01</span><div><h2>Where to?</h2><p>We&apos;ll deliver to the location you picked.</p></div></div><div className="selected-address"><span className="address-icon">⌖</span><div><strong>Ikeja, Lagos</strong><span>12 Adeola Street · Home</span></div><button onClick={() => undefined}>Change</button></div></section><section className="checkout-section"><div className="checkout-section-heading"><span>02</span><div><h2>When feels right?</h2><p>Your nearby store has these windows open.</p></div></div><div className="delivery-options">{deliverySlots.map((item, index) => <button key={item.time} className={slot === index ? "delivery-option selected" : "delivery-option"} onClick={() => setSlot(index)}><span className="radio-mark" /><div><strong>{item.time}</strong><small>{item.note}</small></div><b>{item.price === 0 ? "Free" : formatNaira(item.price)}</b></button>)}</div></section><section className="checkout-section"><div className="checkout-section-heading"><span>03</span><div><h2>How shall we settle?</h2><p>Payment is handled securely by Paystack.</p></div></div><div className="payment-option selected"><span className="card-symbol">▰</span><div><strong>Card or bank transfer</strong><span>Secure payment via Paystack</span></div><span className="payment-check">✓</span></div></section></div><aside className="summary-card checkout-summary"><span className="section-kicker">Order summary</span><h2>Your good stuff.</h2><div className="checkout-items"><span>{lines.length || 3} items</span><span>{formatNaira(subtotal || 16800)}</span></div><div className="summary-row"><span>Delivery</span><strong>{formatNaira(delivery)}</strong></div><div className="summary-total"><span>To pay</span><strong>{formatNaira((subtotal || 16800) + delivery)}</strong></div>{quoteError && <p className="form-error">{quoteError}</p>}<button className="primary-button full-button" onClick={placeOrder}>Place order <span>→</span></button><span className="secure-note">🔒 You&apos;re in safe hands.</span></aside></div></main>;
}

export function AccountPage() {
  return <main className="page-width account-page"><div className="account-welcome"><div><span className="section-kicker">Good to see you</span><h1>Hello, <em>Amaka.</em></h1><p>Your favourite things, one calm place.</p></div><div className="account-avatar">A</div></div><div className="account-grid"><Link href="/orders" className="account-tile tile-blue"><span className="tile-icon">◷</span><strong>Your orders</strong><p>Track a delivery or repeat a good one.</p><span className="tile-arrow">↗</span></Link><Link href="/favorites" className="account-tile tile-pink"><span className="tile-icon">♡</span><strong>Saved things</strong><p>The products you said “later” to.</p><span className="tile-arrow">↗</span></Link><div className="account-tile tile-cream"><span className="tile-icon">⌖</span><strong>Your places</strong><p>Home · Work · That one friend&apos;s house.</p><button className="underlined-button">Manage places</button></div><div className="account-tile tile-green"><span className="tile-icon">✦</span><strong>Pantry plans</strong><p>Less thinking. More dinner.</p><Link href="/plans" className="underlined-button">See your plans</Link></div></div></main>;
}

export function OrdersPage() {
  return <main className="page-width orders-page"><div className="orders-heading"><div><span className="section-kicker">Your good stuff, accounted for</span><h1>Orders</h1></div><span className="order-count">03 total</span></div><div className="orders-list"><div className="order-card current-order"><div className="order-status"><span className="live-dot" /> Out for delivery</div><div className="order-card-main"><div><span className="order-date">Today · 09:42</span><h2>Order KS–824301</h2><p>Nigerian citrus box, Agege bread loaf<br />+ 3 more good things</p></div><div className="order-illustration">🛵</div></div><div className="order-progress"><span className="progress-done" /><span className="progress-done" /><span className="progress-active" /><span /><span /></div><div className="progress-labels"><span>Confirmed</span><span>Picked</span><span>On the way</span><span>At your door</span></div><Link href="/help" className="text-link">See delivery details <span>↗</span></Link></div><div className="order-card"><div className="order-status muted-status">Delivered · 28 Aug</div><div className="order-card-main"><div><span className="order-date">28 Aug 2026</span><h2>Order KS–810662</h2><p>Nigerian morning roast, Ogbomoso honey<br />+ 4 more good things</p></div><strong className="order-total">₦18,400</strong></div><div className="order-card-actions"><button className="outline-button">View order</button><button className="primary-small-button">Buy it again <span>↗</span></button></div></div></div></main>;
}

export function FavoritesPage() {
  const saved = useSelector((state: RootState) => state.saved.slugs);
  const activeProducts = useActiveProducts();
  const savedProducts = activeProducts.filter((product) => saved.includes(product.slug));
  return <main className="page-width favorites-page"><div className="favorites-heading"><span className="section-kicker">For future you</span><h1>Saved, for later.</h1><p>Your personal shelf of “ooh, I want that”.</p></div>{savedProducts.length ? <ProductGrid items={savedProducts} /> : <div className="empty-page saved-empty"><span className="empty-emoji">♡</span><h2>Nothing saved yet.</h2><p>Tap the little heart on anything that makes your kitchen feel more like you.</p><Link href="/shop" className="primary-button">Find something lovely <span>→</span></Link></div>}</main>;
}

export function PlansPage() {
  return <main className="page-width plans-page"><section className="plans-hero"><div><span className="section-kicker">A little less thinking</span><h1>Pantry plans<br /><em>for future you.</em></h1><p>Build a rhythm around the things you always reach for. We&apos;ll remind you before the cupboard gets dramatic.</p><button className="primary-button">Create a plan <span>→</span></button></div><div className="plans-stack"><div>🥫<span>Monthly staples</span></div><div>☕<span>Morning ritual</span></div><div>🫙<span>Cooking basics</span></div></div></section><section className="plans-list"><SectionTitle kicker="Start somewhere easy" title="Plans with good bones" /><div className="plan-row"><div className="plan-row-art">🍝</div><div><span className="section-kicker">The weeknight one</span><h3>15-minute dinners</h3><p>8 pantry staples · every 2 weeks</p></div><button className="outline-button">Add plan +</button></div><div className="plan-row"><div className="plan-row-art">🥣</div><div><span className="section-kicker">The slow morning</span><h3>Breakfast, sorted</h3><p>6 breakfast favourites · every month</p></div><button className="outline-button">Add plan +</button></div></section></main>;
}

export function HelpPage() {
  const faqs = ["How does KlemStore pick my store?", "Can I change my delivery location?", "What happens if something is out of stock?", "How do I track my order?"];
  const [open, setOpen] = useState(0);
  return <main className="page-width help-page"><div className="help-hero"><span className="section-kicker">We&apos;re good listeners</span><h1>How can we<br /><em>make it easier?</em></h1><p>Ask a question, find a quick answer or talk to a human who knows where the good bread is.</p><div className="search-field"><span>⌕</span><input placeholder="Search help" /></div></div><div className="help-layout"><div className="faq-list"><span className="section-kicker">Frequently asked, thoughtfully answered</span>{faqs.map((faq, index) => <div className={open === index ? "faq-item open" : "faq-item"} key={faq}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{faq}</span><b>{open === index ? "−" : "+"}</b></button>{open === index && <p>{index === 0 ? "We use your delivery location, availability, store service areas and route time to quietly choose the best nearby store. You see the experience, not the internal hand-off." : index === 1 ? "Absolutely. Tap the delivery location at the top of any page and choose a new address. Your catalogue will update around it." : index === 2 ? "We will never let you check out with a surprise. If a nearby item changes, we suggest the closest lovely alternative before payment." : "Open Orders from your account to see the latest status, delivery window and helpful details."}</p>}</div>)}</div><div className="contact-card"><span className="contact-spark">✦</span><h2>Still curious?</h2><p>Our humans are around Monday–Saturday, 8am–8pm.</p><button className="dark-button">Start a chat <span>↗</span></button></div></div></main>;
}
