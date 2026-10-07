"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  categories,
  curatedSlugs,
  discountPercent,
  formatNaira,
  getCategory,
  getProduct,
  pickProducts,
  products,
  type Product,
} from "../lib/data";
import { Icon, Stars } from "./Icons";
import { categoryOf, useActiveProducts, useAddToBag, useCategoryName, useLocaleCopy, useReveal } from "./hooks";
import { Reveal } from "./Reveal";
import { MiniCart, QuickView, ScrollTop, Toast } from "./Overlays";
import { SearchBox } from "./SearchBox";
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
import { cartOpened, quickViewOpened } from "../lib/features/ui/uiSlice";
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

function LocaleBootstrap() {
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

  return null;
}

function LanguageSwitcher({ align = "right" }: { align?: "left" | "right" }) {
  const { t } = useLocaleCopy();
  const dispatch = useDispatch();
  const locale = useSelector((state: RootState) => state.locale.language);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = localeOptions.find((option) => option.code === locale) || localeOptions[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const choose = (next: typeof locale) => {
    dispatch(languageChanged(next));
    try { window.localStorage?.setItem("klemstore-language", next); } catch { /* Use the cookie fallback below in restricted webviews. */ }
    document.cookie = `klemstore-language=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setOpen(false);
  };

  return (
    <div className="lang" ref={rootRef}>
      <button type="button" className="lang-trigger" onClick={() => setOpen((value) => !value)} aria-haspopup="listbox" aria-expanded={open} aria-label={`${t("chooseLanguage")}: ${current.label}`}>
        <Icon name="globe" size={18} /><span>{current.nativeLabel}</span><Icon name="chevron" size={14} />
      </button>
      {open && (
        <ul className={`lang-menu lang-menu-${align}`} role="listbox" aria-label={t("chooseLanguage")}>
          {localeOptions.map((option) => (
            <li key={option.code} role="option" aria-selected={option.code === locale}>
              <button type="button" className={option.code === locale ? "lang-option selected" : "lang-option"} onClick={() => choose(option.code)} lang={option.code}>
                <b>{option.short}</b><span><strong>{option.nativeLabel}</strong><small>{option.label}</small></span>{option.code === locale && <Icon name="check" size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-frame">
      <CoreApiBridge />
      <LocaleBootstrap />
      <AnnouncementBar />
      <SiteHeader />
      {children}
      <SiteFooter />
      <MiniCart />
      <Toast />
      <QuickView />
      <ScrollTop />
    </div>
  );
}

function AnnouncementBar() {
  const { t } = useLocaleCopy();
  return (
    <div className="announcement-bar">
      <div className="page-width announcement-inner">
        <span><Icon name="truck" size={18} /> {t("announceShip")}</span>
        <span className="hide-sm"><Icon name="refresh" size={18} /> {t("announceReturns")}</span>
        <span className="hide-md"><Icon name="gift" size={18} /> {t("announceFirst")}</span>
      </div>
    </div>
  );
}

function SiteHeader() {
  const { t } = useLocaleCopy();
  const categoryName = useCategoryName();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartCount = useSelector((state: RootState) => selectCartCount(state));
  const savedCount = useSelector((state: RootState) => state.saved.slugs.length);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const activeLocation = useSelector((state: RootState) => state.context.current?.displayLabel);

  useEffect(() => { setMenuOpen(false); setMobileSearch(false); setCategoriesOpen(false); }, [pathname]);
  useEffect(() => {
    if (!categoriesOpen) return;
    const onPointer = (event: MouseEvent) => { if (!navRef.current?.contains(event.target as Node)) setCategoriesOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setCategoriesOpen(false); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [categoriesOpen]);

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
    const query = String(new FormData(event.currentTarget).get("q") || "").trim();
    setMobileSearch(false);
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };

  const navLinks = [
    { href: "/", label: t("home"), active: pathname === "/" },
    { href: "/shop", label: t("shop"), active: pathname === "/shop" },
    { href: "/shop?sort=new", label: t("newArrivals"), active: false },
    { href: "/shop?sort=best", label: t("bestSellers"), active: false },
    { href: "/shop?deals=1", label: t("deals"), active: false },
  ];

  return (
    <>
      <header className="site-header">
        <div className="page-width header-row">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label={t("openMenu")}><Icon name="menu" size={22} /></button>
          <Link href="/" className="brand" aria-label="KlemStore home">
            <img src="/klemstore-logo.png" alt="KlemStore" className="brand-image" />
          </Link>

          <SearchBox />

          <div className="header-actions">
            <button className="icon-button search-button" onClick={() => setMobileSearch((open) => !open)} aria-label={t("search")}><Icon name="search" size={21} /></button>
            <Link href="/account" className="header-action" aria-label={t("yourAccount")}><Icon name="user" size={22} /><span>{t("account")}</span></Link>
            <Link href="/favorites" className="header-action" aria-label={`${t("saved")} · ${savedCount}`}><Icon name="heart" size={22} /><span>{t("saved")}</span>{savedCount > 0 && <i className="count-dot">{savedCount}</i>}</Link>
            <button className="header-action cart-trigger" data-cart-target onClick={() => dispatch(cartOpened())} aria-label={`${t("bag")} · ${cartCount}`}><Icon name="bag" size={22} /><span>{t("bag")}</span><i className="count-dot" key={cartCount}>{cartCount}</i></button>
          </div>
        </div>

        {mobileSearch && <div className="page-width mobile-search"><SearchBox className="header-search mobile" autoFocus onDone={() => setMobileSearch(false)} /></div>}

        <div className="header-nav-bar" ref={navRef}>
          <div className="page-width header-nav-row">
            <button className="location-pill" onClick={() => setLocationOpen(true)} aria-label={`${t("change")} ${t("deliveringTo").toLowerCase()}`}>
              <Icon name="pin" size={17} /><span><small>{t("deliveringTo")}</small><strong>{activeLocation || "Ikeja, Lagos"}</strong></span><Icon name="chevron" size={14} />
            </button>
            <nav className="header-nav" aria-label="Main navigation">
              {navLinks.map((link) => <Link key={link.href} href={link.href} className={link.active ? "nav-link active" : "nav-link"}>{link.label}</Link>)}
              <button type="button" className={categoriesOpen ? "nav-link nav-button open" : "nav-link nav-button"} onClick={() => setCategoriesOpen((open) => !open)} aria-expanded={categoriesOpen} aria-haspopup="true">{t("categoriesNav")} <Icon name="chevron" size={14} /></button>
            </nav>
            <LanguageSwitcher />
          </div>
          {categoriesOpen && (
            <div className="mega-menu">
              <div className="page-width mega-grid">
                {categories.map((category) => <Link key={category.slug} href={`/shop/${category.slug}`} className="mega-link"><img src={category.image} alt="" loading="lazy" /><span><strong>{categoryName(category.slug, category.name)}</strong><small>{category.count} {t("items")}</small></span></Link>)}
              </div>
            </div>
          )}
        </div>
      </header>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/" className={pathname === "/" ? "mobile-nav-link selected" : "mobile-nav-link"}><Icon name="home" size={22} />{t("home")}</Link>
        <Link href="/shop" className={pathname.startsWith("/shop") ? "mobile-nav-link selected" : "mobile-nav-link"}><Icon name="grid" size={22} />{t("shop")}</Link>
        <Link href="/favorites" className={pathname.startsWith("/favorites") ? "mobile-nav-link selected" : "mobile-nav-link"}><Icon name="heart" size={22} />{t("saved")}</Link>
        <Link href="/account" className={pathname.startsWith("/account") ? "mobile-nav-link selected" : "mobile-nav-link"}><Icon name="user" size={22} />{t("account")}</Link>
        <Link href="/cart" data-cart-target className={pathname.startsWith("/cart") ? "mobile-nav-link selected" : "mobile-nav-link"}><span className="mobile-bag"><Icon name="bag" size={22} />{cartCount > 0 && <em>{cartCount}</em>}</span>{t("bag")}</Link>
      </nav>

      {menuOpen && (
        <div className="overlay drawer-overlay" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <button className="overlay-scrim" onClick={() => setMenuOpen(false)} aria-label={t("closeMenu")} />
          <div className="drawer">
            <div className="drawer-head"><img src="/klemstore-logo.png" alt="KlemStore" className="brand-image" /><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label={t("closeMenu")}><Icon name="close" size={22} /></button></div>
            <button className="location-pill drawer-location" onClick={() => { setMenuOpen(false); setLocationOpen(true); }}><Icon name="pin" size={17} /><span><small>{t("deliveringTo")}</small><strong>{activeLocation || "Ikeja, Lagos"}</strong></span><Icon name="chevron" size={14} /></button>
            <span className="drawer-label">{t("shopByDepartment")}</span>
            {categories.map((category) => <Link key={category.slug} href={`/shop/${category.slug}`} className="drawer-link"><img src={category.image} alt="" />{categoryName(category.slug, category.name)}<Icon name="chevronRight" size={16} /></Link>)}
            <span className="drawer-label">{t("moreLinks")}</span>
            <Link href="/shop?sort=new" className="drawer-link plain">{t("newArrivals")}<Icon name="chevronRight" size={16} /></Link>
            <Link href="/shop?deals=1" className="drawer-link plain">{t("deals")}<Icon name="chevronRight" size={16} /></Link>
            <Link href="/orders" className="drawer-link plain">{t("trackOrder")}<Icon name="chevronRight" size={16} /></Link>
            <Link href="/help" className="drawer-link plain">{t("helpContact")}<Icon name="chevronRight" size={16} /></Link>
            <div className="drawer-lang"><LanguageSwitcher align="left" /></div>
          </div>
        </div>
      )}

      {locationOpen && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Choose delivery location">
          <button className="overlay-scrim" onClick={() => setLocationOpen(false)} aria-label="Close location picker" />
          <div className="location-sheet">
            <div className="sheet-handle" />
            <button className="close-button" onClick={() => setLocationOpen(false)} aria-label="Close"><Icon name="close" size={18} /></button>
            <span className="section-kicker">{t("deliveringTo")}</span>
            <h2>Where should we deliver?</h2>
            <p className="muted-copy">We&apos;ll tune your catalogue, availability and delivery promise to the store closest to you.</p>
            <label className="field-label" htmlFor="location">{t("deliveringTo")}</label>
            <div className="input-with-icon"><Icon name="pin" size={18} /><input id="location" autoFocus value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="Search an address or neighbourhood" /></div>
            <div className="location-suggestions">
              {["Ikeja, Lagos", "Yaba, Lagos", "Victoria Island, Lagos"].map((suggestion) => (
                <button key={suggestion} onClick={() => setLocationInput(suggestion)}><Icon name="pin" size={16} />{suggestion}<Icon name="chevronRight" size={16} /></button>
              ))}
            </div>
            <button className="primary-button full-button" onClick={applyLocation}>{t("change")} <Icon name="arrow" size={18} /></button>
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
      <section className="newsletter">
        <div className="page-width newsletter-inner">
          <div><h2>{t("newsletterTitle")}</h2><p>{t("newsletterCopy")}</p></div>
          <form className="newsletter-input" onSubmit={(event) => event.preventDefault()}><input type="email" placeholder={t("emailPlaceholder")} aria-label={t("emailPlaceholder")} /><button type="submit">{t("subscribe")}</button></form>
          <span className="script-note" aria-hidden="true">Good people,<br />brighter days <Icon name="heart" size={16} /></span>
        </div>
      </section>
      <div className="footer-dark">
        <div className="page-width footer-grid">
          <div className="footer-brand"><img src="/klemstore-logo.png" alt="KlemStore" className="brand-image" /><p>{t("footerDescription")}</p>
            <div className="socials" aria-label={t("followUs")}><a href="#" aria-label="Facebook"><Icon name="facebook" size={18} /></a><a href="#" aria-label="Instagram"><Icon name="instagram" size={18} /></a><a href="#" aria-label="YouTube"><Icon name="youtube" size={18} /></a></div>
          </div>
          <div className="footer-links"><span className="footer-heading">{t("footerShop")}</span><Link href="/shop">{t("allProducts")}</Link><Link href="/shop?sort=new">{t("newArrivals")}</Link><Link href="/shop?sort=best">{t("bestSellers")}</Link><Link href="/shop?deals=1">{t("deals")}</Link></div>
          <div className="footer-links"><span className="footer-heading">{t("footerHelp")}</span><Link href="/orders">{t("trackOrder")}</Link><Link href="/help">{t("returnsRefunds")}</Link><Link href="/help">{t("shippingInfo")}</Link><Link href="/help">{t("faq")}</Link></div>
          <div className="footer-links"><span className="footer-heading">{t("footerCompany")}</span><Link href="/help">{t("aboutUs")}</Link><Link href="/help">{t("sustainability")}</Link><Link href="/help">{t("careers")}</Link><Link href="/help">{t("contactUs")}</Link></div>
        </div>
        <div className="page-width footer-bottom"><span>{t("rights")}</span><span className="footer-legal"><a href="#">{t("privacyPolicy")}</a><a href="#">{t("termsOfService")}</a><a href="#">{t("cookieSettings")}</a></span></div>
      </div>
    </footer>
  );
}

function ProductArt({ product, large = false }: { product: Product; large?: boolean }) {
  return <div className={`product-art ${large ? "art-large" : ""}`}>
    <img src={product.image} alt={large ? product.name : ""} loading={large ? "eager" : "lazy"} onError={(event) => { event.currentTarget.style.display = "none"; }} />
    <span className="product-fallback-emoji" aria-hidden="true">{product.emoji}</span>
  </div>;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { t } = useLocaleCopy();
  const dispatch = useDispatch();
  const addToBag = useAddToBag();
  const [added, setAdded] = useState(false);
  const saved = useSelector((state: RootState) => state.saved.slugs.includes(product.slug));
  const discount = discountPercent(product);

  const add = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const image = event.currentTarget.closest(".product-card-top")?.querySelector("img");
    addToBag(product, image || event.currentTarget);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="product-card" style={{ ["--i" as string]: index % 8 }}>
      <div className="product-card-top">
        <Link href={`/product/${product.slug}`} aria-label={product.name}><ProductArt product={product} /></Link>
        {(discount > 0 || product.badge) && <div className="product-flags">{discount > 0 && <span className="flag flag-sale">-{discount}%</span>}{product.badge && <span className="flag">{product.badge}</span>}</div>}
        <button className={saved ? "save-button saved" : "save-button"} onClick={() => dispatch(savedToggled(product.slug))} aria-pressed={saved} aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}><span key={saved ? "on" : "off"} className="heart-pop"><Icon name="heart" size={17} fill={saved ? "currentColor" : "none"} /></span></button>
        <button className="quick-button" onClick={() => dispatch(quickViewOpened(product.slug))}><Icon name="eye" size={15} /> {t("quickView")}</button>
        <button className={added ? "add-button added" : "add-button"} onClick={add} aria-label={added ? t("addedToBag") : `${t("addToBag")}: ${product.name}`}><Icon name={added ? "check" : "bag"} size={19} /></button>
      </div>
      <div className="product-card-info">
        <Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link>
        <span className="price-line"><strong className="product-price">{formatNaira(product.price)}</strong>{discount > 0 && <s>{formatNaira(product.compareAt!)}</s>}</span>
        {product.rating && <span className="product-rating"><Stars rating={product.rating} /><small>({product.reviews})</small></span>}
      </div>
    </article>
  );
}

function ProductGrid({ items, columns }: { items: Product[]; columns?: 3 | 4 }) {
  const [ref, shown] = useReveal<HTMLDivElement>(0.05);
  return <div ref={ref} className={`product-grid reveal-grid${columns === 3 ? " cols-3" : ""}${shown ? " in-view" : ""}`}>{items.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div>;
}

function SectionTitle({ title, copy, href, linkLabel }: { kicker?: string; title: string; copy?: string; href?: string; linkLabel?: string }) {
  const { t } = useLocaleCopy();
  return <div className="section-title"><div><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{href && <Link href={href} className="text-link">{linkLabel || t("viewAll")} <Icon name="arrow" size={15} /></Link>}</div>;
}

function HomeHero() {
  const { t } = useLocaleCopy();
  return <section className="commerce-hero">
    <img className="hero-photo" src="/images/hero.png" alt="" fetchPriority="high" />
    <div className="hero-wash" />
    <div className="page-width commerce-hero-inner">
      <div className="commerce-hero-copy">
        <span className="hero-eyebrow">{t("heroEyebrow")}</span>
        <h1><span className="line">{t("heroLine1")}</span><span className="line">{t("heroLine2")}</span></h1>
        <p>{t("heroSub")}</p>
        <Link href="/shop" className="primary-button hero-cta">{t("shopEverything")} <Icon name="arrow" size={18} /></Link>
        <div className="hero-proof">
          <span className="proof-item"><Icon name="leaf" size={26} /><span>{t("trustCurated")}</span></span>
          <span className="proof-item"><Icon name="pin" size={26} /><span>{t("trustLocal")}</span></span>
          <span className="proof-item"><Icon name="star" size={26} /><span>{t("trustLoved")}</span></span>
        </div>
      </div>
      <p className="hero-script" aria-hidden="true">Small choices,<br />big impact <Icon name="heart" size={22} /></p>
    </div>
  </section>;
}

function CategoryStrip() {
  const { t } = useLocaleCopy();
  const categoryName = useCategoryName();
  const trackRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = useCallback(() => {
    const element = trackRef.current;
    if (element) setEdge({ start: element.scrollLeft < 8, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);
  const scroll = (direction: 1 | -1) => trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth * 0.7, behavior: "smooth" });
  return <Reveal as="section" className="page-width category-wrap">
    <button className="strip-arrow prev" onClick={() => scroll(-1)} disabled={edge.start} aria-label="Previous"><Icon name="chevronLeft" size={18} /></button>
    <div className="category-strip" ref={trackRef} onScroll={update} aria-label={t("shopByDepartment")}>
      {categories.map((category) => <Link href={`/shop/${category.slug}`} key={category.slug} className="category-chip"><span className="category-bubble"><img src={category.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /></span><strong>{categoryName(category.slug, category.name)}</strong></Link>)}
    </div>
    <button className="strip-arrow next" onClick={() => scroll(1)} disabled={edge.end} aria-label="Next"><Icon name="chevronRight" size={18} /></button>
  </Reveal>;
}

const featuredTabs = ["all", "women", "men", "shoes", "home-living", "electronics", "kids"];

function FeaturedSection() {
  const { t } = useLocaleCopy();
  const categoryName = useCategoryName();
  const activeProducts = useActiveProducts();
  const [tab, setTab] = useState("all");
  const items = useMemo(() => {
    const curated = pickProducts(activeProducts, curatedSlugs.featured, 0);
    if (tab === "all") return curated;
    const name = categories.find((category) => category.slug === tab)?.name;
    const inTab = activeProducts.filter((product) => product.category === name).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
    return inTab.length ? inTab : curated;
  }, [activeProducts, tab]);
  return <Reveal as="section" className="page-width home-section">
    <div className="section-title"><h2>{t("featuredProducts")}</h2><Link href={tab === "all" ? "/shop" : `/shop/${tab}`} className="text-link">{t("viewAll")} <Icon name="arrow" size={15} /></Link></div>
    <div className="tab-row" role="tablist">{featuredTabs.map((id) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "tab-chip active" : "tab-chip"} onClick={() => setTab(id)}>{id === "all" ? t("tabAll") : categoryName(id, categories.find((category) => category.slug === id)?.name || id)}</button>)}</div>
    <div key={tab} className="tab-panel"><ProductGrid items={items} /></div>
  </Reveal>;
}

function HomeProductSection({ title, copy, href, items }: { title: string; copy?: string; href: string; items: Product[] }) {
  return <Reveal as="section" className="page-width home-section"><SectionTitle title={title} copy={copy} href={href} /><ProductGrid items={items} /></Reveal>;
}

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => { const now = new Date(); const end = new Date(now); end.setHours(24, 0, 0, 0); setLeft(end.getTime() - now.getTime()); };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  if (left === null) return ["--", "--", "--"];
  const pad = (value: number) => String(value).padStart(2, "0");
  return [pad(Math.floor(left / 3600000)), pad(Math.floor(left / 60000) % 60), pad(Math.floor(left / 1000) % 60)];
}

function DealsSection() {
  const { t } = useLocaleCopy();
  const activeProducts = useActiveProducts();
  const [hours, minutes, seconds] = useCountdown();
  const deals = useMemo(() => {
    const discounted = [...activeProducts].filter((product) => discountPercent(product) > 0).sort((a, b) => discountPercent(b) - discountPercent(a));
    const nonGrocery = discounted.filter((product) => product.category !== "Groceries");
    return (nonGrocery.length >= 4 ? nonGrocery : discounted).slice(0, 4);
  }, [activeProducts]);
  if (!deals.length) return null;
  return <Reveal as="section" className="page-width home-section">
    <div className="deals">
      <div className="deals-lead">
        <span className="promo-kicker"><Icon name="bolt" size={15} /> {t("deals")}</span>
        <h2>{t("dealsOfDay")}</h2>
        <p>{t("dealsCopy")}</p>
        <span className="deals-label">{t("endsIn")}</span>
        <div className="countdown" role="timer" aria-label={t("endsIn")}><span><b>{hours}</b><small>{t("hrs")}</small></span><i>:</i><span><b>{minutes}</b><small>{t("mins")}</small></span><i>:</i><span><b>{seconds}</b><small>{t("secs")}</small></span></div>
        <Link href="/shop?deals=1" className="primary-button">{t("shopTheSale")} <Icon name="arrow" size={17} /></Link>
      </div>
      <ProductGrid items={deals} />
    </div>
  </Reveal>;
}

function HomePromoGrid() {
  const { t } = useLocaleCopy();
  return <Reveal as="section" stagger className="page-width home-section promo-grid">
    <Link href="/shop/home-living" className="promo-card promo-home">
      <img src="/images/p/mid-century-armchair.jpg" alt="" loading="lazy" />
      <div><h3>{t("promoHomeTitle")}</h3><p>{t("promoHomeCopy")}</p><span className="promo-button">{t("promoHomeCta")} <Icon name="arrow" size={15} /></span></div>
    </Link>
    <Link href="/shop/beauty" className="promo-card promo-beauty">
      <img src="/images/p/makeup-palette.jpg" alt="" loading="lazy" />
      <div><h3>{t("promoBeautyTitle")}</h3><p>{t("promoBeautyCopy")}</p><span className="promo-button">{t("promoBeautyCta")} <Icon name="arrow" size={15} /></span></div>
    </Link>
  </Reveal>;
}

function DepartmentBanners() {
  const { t } = useLocaleCopy();
  const categoryName = useCategoryName();
  const picks = ["kids", "shoes", "pets"].map((slug) => categories.find((category) => category.slug === slug)).filter((category): category is (typeof categories)[number] => Boolean(category));
  return <Reveal as="section" stagger className="page-width home-section banner-trio">
    {picks.map((category) => <Link key={category.slug} href={`/shop/${category.slug}`} className="banner-card"><img src={category.image} alt="" loading="lazy" /><span><small>{category.count} {t("items")}</small><strong>{categoryName(category.slug, category.name)}</strong><em>{t("shop")} <Icon name="arrow" size={14} /></em></span></Link>)}
  </Reveal>;
}

function WhyStrip() {
  const { t } = useLocaleCopy();
  const items = [
    { icon: "truck", title: t("whyFreeShip"), copy: t("whyFreeShipCopy") },
    { icon: "shield", title: t("whySecure"), copy: t("whySecureCopy") },
    { icon: "refresh", title: t("whyReturns"), copy: t("whyReturnsCopy") },
    { icon: "leaf", title: t("whyCurated"), copy: t("whyCuratedCopy") },
    { icon: "heart", title: t("whyLoved"), copy: t("whyLovedCopy") },
  ] as const;
  return <Reveal as="section" className="page-width home-section"><div className="why-strip"><h2>{t("whyShop")}</h2>{items.map((item) => <div key={item.title}><Icon name={item.icon} size={30} /><span><strong>{item.title}</strong><small>{item.copy}</small></span></div>)}</div></Reveal>;
}

export function HomePage() {
  const { t } = useLocaleCopy();
  const activeProducts = useActiveProducts();
  const arrivals = pickProducts(activeProducts, curatedSlugs.newArrivals, 4);
  const best = pickProducts(activeProducts, curatedSlugs.bestSellers, 8);
  return <main className="commerce-home">
    <HomeHero />
    <CategoryStrip />
    <FeaturedSection />
    <HomePromoGrid />
    <DealsSection />
    <HomeProductSection title={t("newArrivals")} href="/shop?sort=new" items={arrivals} />
    <DepartmentBanners />
    <HomeProductSection title={t("bestSellers")} href="/shop?sort=best" items={best} />
    <WhyStrip />
  </main>;
}

function PageHeading({ title, copy, crumbs }: { title: string; copy?: string; crumbs?: { label: string; href?: string }[] }) {
  return <div className="page-heading">
    {crumbs && <nav className="breadcrumbs" aria-label="Breadcrumb">{crumbs.map((crumb, index) => <span key={crumb.label}>{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}{index < crumbs.length - 1 && <Icon name="chevronRight" size={13} />}</span>)}</nav>}
    <h1>{title}</h1>
    {copy && <p>{copy}</p>}
  </div>;
}

const PAGE_SIZE = 12;
const popularity = (product: Product) => (product.rating || 0) * Math.log10((product.reviews || 1) + 10);

export function ShopPage({ category, initialQuery = "", initialSort = "", dealsOnly = false }: { category?: string; initialQuery?: string; initialSort?: string; dealsOnly?: boolean }) {
  const { t } = useLocaleCopy();
  const categoryName = useCategoryName();
  const router = useRouter();
  const searchQuery = initialQuery.trim();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [sort, setSort] = useState(initialSort === "best" ? "Best rated" : "Featured");
  const [maxPrice, setMaxPrice] = useState(0);
  const [saleOnly, setSaleOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const activeProducts = useActiveProducts();
  const categoryInfo = category ? getCategory(category) : undefined;
  const source = category ? activeProducts.filter((product) => product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") === category || product.category === categoryInfo?.name) : activeProducts;
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    setSort(initialSort === "best" ? "Best rated" : "Featured");
  }, [initialSort]);
  const priceCeiling = useMemo(() => Math.max(...source.map((product) => product.price), 0), [source]);
  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    let next = normalizedQuery
      ? source.filter((product) => [product.name, product.category, product.unit, product.description, product.note].some((value) => value.toLowerCase().includes(normalizedQuery)))
      : source;
    if (dealsOnly || saleOnly) next = next.filter((product) => discountPercent(product) > 0);
    if (topRated) next = next.filter((product) => (product.rating || 0) >= 4);
    if (maxPrice > 0) next = next.filter((product) => product.price <= maxPrice);
    if (sort === "Price: low to high") return [...next].sort((a, b) => a.price - b.price);
    if (sort === "Price: high to low") return [...next].sort((a, b) => b.price - a.price);
    if (sort === "Best rated") return [...next].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
    if (initialSort === "new") return [...next].reverse().sort((a, b) => Number(/new/i.test(b.badge || "")) - Number(/new/i.test(a.badge || "")));
    return [...next].sort((a, b) => popularity(b) - popularity(a));
  }, [dealsOnly, initialSort, maxPrice, saleOnly, searchQuery, sort, source, topRated]);
  const signature = `${category}|${searchQuery}|${sort}|${maxPrice}|${saleOnly}|${topRated}|${dealsOnly}|${initialSort}`;
  useEffect(() => { setVisible(PAGE_SIZE); }, [signature]);
  const basePath = category ? `/shop/${category}` : "/shop";
  const title = dealsOnly ? t("deals") : initialSort === "new" ? t("newArrivals") : initialSort === "best" ? t("bestSellers") : categoryInfo ? categoryName(categoryInfo.slug, categoryInfo.name) : t("shopEverythingHeading");
  const filtersActive = saleOnly || topRated || maxPrice > 0;
  const shown = filtered.slice(0, visible);
  const submitCatalogueSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    router.push(query ? `${basePath}?q=${encodeURIComponent(query)}` : basePath);
  };

  return <main className="page-width shop-page">
    <PageHeading title={title} copy={categoryInfo ? t("availableFromStore") : t("catalogueDescription")} crumbs={[{ label: t("home"), href: "/" }, { label: t("shop"), href: category ? "/shop" : undefined }, ...(categoryInfo ? [{ label: categoryName(categoryInfo.slug, categoryInfo.name) }] : [])]} />
    <div className="shop-toolbar">
      <form className="catalogue-search" onSubmit={submitCatalogueSearch}><Icon name="search" size={18} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={categoryInfo ? `${t("search")} ${categoryName(categoryInfo.slug, categoryInfo.name).toLowerCase()}` : t("searchProducts")} aria-label={t("search")} />{searchInput && <button type="button" className="clear-search" onClick={() => { setSearchInput(""); router.push(basePath); }} aria-label={t("clearSearch")}><Icon name="close" size={16} /></button>}</form>
      <div className="shop-toolbar-right"><span className="result-count">{filtered.length} {t("products")}</span><label className="sort-select">{t("sortBy")} <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="Featured">{t("featured")}</option><option value="Best rated">{t("bestRated")}</option><option value="Price: low to high">{t("lowToHigh")}</option><option value="Price: high to low">{t("highToLow")}</option></select></label></div>
    </div>
    <div className="filter-chips" aria-label={t("filters")}>
      <button className={saleOnly || dealsOnly ? "tab-chip active" : "tab-chip"} onClick={() => setSaleOnly((value) => !value)} aria-pressed={saleOnly || dealsOnly}><Icon name="tag" size={14} /> {t("onSaleOnly")}</button>
      <button className={topRated ? "tab-chip active" : "tab-chip"} onClick={() => setTopRated((value) => !value)} aria-pressed={topRated}><Icon name="star" size={14} /> {t("rating4")}</button>
      {maxPrice > 0 && <button className="tab-chip active" onClick={() => setMaxPrice(0)}>≤ {formatNaira(maxPrice)} <Icon name="close" size={13} /></button>}
      {filtersActive && <button className="chip-clear" onClick={() => { setSaleOnly(false); setTopRated(false); setMaxPrice(0); }}>{t("clearAll")}</button>}
    </div>
    {searchQuery && <div className="search-result-summary"><span>{t("searchResultsFor")} <strong>&ldquo;{searchQuery}&rdquo;</strong></span><Link href={basePath}>{t("clearSearch")}</Link></div>}
    <div className="shop-content">
      <aside className="shop-sidebar">
        <strong>{t("departments")}</strong>
        <Link href="/shop" className={!category ? "sidebar-link selected" : "sidebar-link"}><span className="sidebar-dot"><Icon name="grid" size={15} /></span>{t("allProducts")}</Link>
        {categories.map((item) => <Link href={`/shop/${item.slug}`} key={item.slug} className={category === item.slug ? "sidebar-link selected" : "sidebar-link"}><span className="sidebar-dot"><img src={item.image} alt="" /></span>{categoryName(item.slug, item.name)}<small>{item.count}</small></Link>)}
        {priceCeiling > 0 && <div className="sidebar-filter"><strong>{t("maxPrice")}</strong><input type="range" min={0} max={priceCeiling} step={500} value={maxPrice || priceCeiling} onChange={(event) => setMaxPrice(Number(event.target.value) >= priceCeiling ? 0 : Number(event.target.value))} aria-label={t("maxPrice")} /><div><span>{formatNaira(0)}</span><b>{formatNaira(maxPrice || priceCeiling)}</b></div></div>}
        <div className="sidebar-note"><Icon name="pin" size={20} /><strong>{t("localStock")}</strong><span>{t("localStockDescription")}</span></div>
      </aside>
      {filtered.length ? <div className="shop-results">
        <div key={signature}><ProductGrid items={shown} columns={3} /></div>
        {filtered.length > visible && <div className="load-more"><span>{t("showingCount", { shown: String(shown.length), total: String(filtered.length) })}</span><progress value={shown.length} max={filtered.length} /><button className="outline-button" onClick={() => setVisible((value) => value + PAGE_SIZE)}>{t("loadMore")}</button></div>}
      </div> : <div className="empty-search"><span><Icon name="search" size={28} /></span><h2>{t("noProductsFound")}</h2><p>{t("noProductsDescription")}</p><Link href={basePath} className="primary-button">{t("clearSearch")} <Icon name="arrow" size={18} /></Link></div>}
    </div>
  </main>;
}

function ReviewBreakdown({ rating, reviews }: { rating: number; reviews: number }) {
  const { t } = useLocaleCopy();
  const weights = [5, 4, 3, 2, 1].map((star) => Math.exp(-Math.abs(star - rating) * 1.9));
  const total = weights.reduce((sum, value) => sum + value, 0);
  return <div className="review-summary">
    <div className="review-score"><strong>{rating.toFixed(1)}</strong><Stars rating={rating} size={16} /><small>{t("basedOn", { n: String(reviews) })}</small></div>
    <ul className="review-bars">{[5, 4, 3, 2, 1].map((star, index) => <li key={star}><span>{star}</span><i><b style={{ width: `${Math.round((weights[index] / total) * 100)}%` }} /></i><em>{Math.round((weights[index] / total) * 100)}%</em></li>)}</ul>
  </div>;
}

export function ProductPage({ slug }: { slug: string }) {
  const { t } = useLocaleCopy();
  const categoryName = useCategoryName();
  const activeProducts = useActiveProducts();
  const product = activeProducts.find((item) => item.slug === slug) || getProduct(slug);
  const dispatch = useDispatch();
  const addToBag = useAddToBag();
  const saved = useSelector((state: RootState) => state.saved.slugs.includes(slug));
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"details" | "reviews" | "shipping">("details");
  const [zoom, setZoom] = useState({ x: 50, y: 50 });
  useEffect(() => { setQuantity(1); setTab("details"); }, [slug]);
  if (!product) return <main className="page-width empty-page"><span className="empty-emoji"><Icon name="box" size={34} /></span><h1>We couldn&apos;t find that product.</h1><p>It may have sold out or moved, but there&apos;s plenty more nearby.</p><Link href="/shop" className="primary-button">{t("shop")} <Icon name="arrow" size={18} /></Link></main>;
  const discount = discountPercent(product);
  const category = categoryOf(product);
  const label = category ? categoryName(category.slug, category.name) : product.category;
  const related = activeProducts.filter((item) => item.slug !== product.slug && item.category === product.category).concat(activeProducts.filter((item) => item.slug !== product.slug && item.category !== product.category)).slice(0, 4);
  return <main className="page-width product-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">{t("home")}</Link><Icon name="chevronRight" size={13} /><Link href="/shop">{t("shop")}</Link><Icon name="chevronRight" size={13} />{category ? <Link href={`/shop/${category.slug}`}>{label}</Link> : <span>{label}</span>}<Icon name="chevronRight" size={13} /><span>{product.name}</span></nav>
    <div className="product-detail">
      <div className="product-detail-art zoomable" onMouseMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); setZoom({ x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 }); }} style={{ ["--zx" as string]: `${zoom.x}%`, ["--zy" as string]: `${zoom.y}%` }}>
        <ProductArt product={product} large />{discount > 0 && <span className="flag flag-sale detail-flag">-{discount}%</span>}
      </div>
      <div className="product-detail-copy">
        <span className="section-kicker">{label}</span>
        <h1>{product.name}</h1>
        {product.rating && <span className="product-rating detail-rating"><Stars rating={product.rating} size={16} /><b>{product.rating.toFixed(1)}</b><button className="link-button" onClick={() => setTab("reviews")}>({product.reviews} {t("reviews")})</button></span>}
        <div className="detail-price-row"><strong className="detail-price">{formatNaira(product.price)}</strong>{discount > 0 && <><s>{formatNaira(product.compareAt!)}</s><span className="flag flag-sale">-{discount}%</span></>}<small>/ {product.unit}</small></div>
        <p className="detail-description">{product.description}</p>
        <div className="detail-actions">
          <div className="quantity-picker"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Icon name="minus" size={16} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Icon name="plus" size={16} /></button></div>
          <button className="primary-button add-detail" onClick={(event) => addToBag(product, document.querySelector(".product-detail-art img") || event.currentTarget, quantity)}><Icon name="bag" size={19} /> {t("addToBag")}{quantity > 1 ? ` · ${quantity}` : ""}</button>
          <button className={saved ? "square-button saved" : "square-button"} onClick={() => dispatch(savedToggled(product.slug))} aria-pressed={saved} aria-label={saved ? t("saved") : t("saveForLater")}><span key={saved ? "on" : "off"} className="heart-pop"><Icon name="heart" size={20} fill={saved ? "currentColor" : "none"} /></span></button>
        </div>
        <div className="detail-meta">
          <span><Icon name="check" size={18} /><b>{t("inStock")}</b><small>{t("inStockCopy")}</small></span>
          <span><Icon name="truck" size={18} /><b>{t("fastDelivery")}</b><small>{t("freeOver")}</small></span>
          <span><Icon name="refresh" size={18} /><b>{t("svcReturns")}</b><small>{t("svcReturnsCopy")}</small></span>
          <span><Icon name="shield" size={18} /><b>{t("secureCheckout")}</b><small>{t("svcSecureCopy")}</small></span>
        </div>
        <div className="tabs" role="tablist">
          {(["details", "reviews", "shipping"] as const).map((id) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "tab active" : "tab"} onClick={() => setTab(id)}>{id === "details" ? t("detailsTab") : id === "reviews" ? t("reviewsTab") : t("shippingTab")}</button>)}
        </div>
        <div className="tab-body" key={tab}>
          {tab === "details" && <><p>{product.description}</p><ul className="spec-list"><li><span>{t("productCol")}</span><b>{product.name}</b></li><li><span>{t("department")}</span><b>{label}</b></li><li><span>{t("quantityCol")}</span><b>{product.unit}</b></li><li><span>SKU</span><b>{product.slug.toUpperCase().slice(0, 14)}</b></li></ul><p className="muted-copy">{product.note}</p></>}
          {tab === "reviews" && (product.rating ? <><h3>{t("reviewsHeading")}</h3><ReviewBreakdown rating={product.rating} reviews={product.reviews || 0} /></> : <p className="muted-copy">{t("noResultsSuggest")}</p>)}
          {tab === "shipping" && <><p>{t("shipCopy1")}</p><p>{t("shipCopy2")}</p></>}
        </div>
        <Link href="/help" className="delivery-note">{t("talkToTeam")} <Icon name="arrow" size={15} /></Link>
      </div>
    </div>
    <section className="related-section"><SectionTitle title={t("related")} href={category ? `/shop/${category.slug}` : "/shop"} /><ProductGrid items={related} /></section>
    <div className="buy-bar"><div><strong>{formatNaira(product.price)}</strong><small>{product.name}</small></div><button className="primary-button" onClick={(event) => addToBag(product, document.querySelector(".product-detail-art img") || event.currentTarget, quantity)}><Icon name="bag" size={18} /> {t("addToBag")}</button></div>
  </main>;
}

export function CartPage() {
  const { t } = useLocaleCopy();
  const dispatch = useDispatch();
  const lines = useSelector((state: RootState) => selectCartLines(state));
  const subtotal = useSelector((state: RootState) => selectCartTotal(state));
  const delivery = subtotal > 15000 || subtotal === 0 ? 0 : 800;
  const progress = Math.min(100, Math.round((subtotal / 15000) * 100));
  return <main className="page-width cart-page">
    <PageHeading title={t("shoppingBag")} copy={lines.length ? `${lines.length} ${t("items")}` : undefined} crumbs={[{ label: t("home"), href: "/" }, { label: t("bag") }]} />
    {lines.length === 0 ? <div className="empty-cart"><div className="empty-basket"><Icon name="bag" size={34} /></div><h2>{t("emptyBag")}</h2><p>{t("emptyBagCopy")}</p><Link href="/shop" className="primary-button">{t("startShopping")} <Icon name="arrow" size={18} /></Link></div> : <div className="cart-layout">
      <div className="cart-lines">
        <div className="shipping-progress"><p>{subtotal >= 15000 ? <b>{t("freeDeliveryUnlocked")}</b> : t("addMoreForFree", { amount: formatNaira(15000 - subtotal) })}</p><span><i style={{ width: `${progress}%` }} /></span></div>
        <div className="cart-line-header"><span>{t("productCol")}</span><span>{t("quantityCol")}</span><span>{t("total")}</span></div>
        {lines.map((line) => <div className="cart-line" key={line.slug}>
          <div className="cart-line-art"><img src={line.image} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>{line.emoji}</span></div>
          <div className="cart-line-name"><Link href={`/product/${line.slug}`}>{line.name}</Link><span>{line.unit}</span><b className="cart-unit-price">{formatNaira(line.price)}</b></div>
          <div className="quantity-picker"><button onClick={() => dispatch(quantityChanged({ slug: line.slug, quantity: line.quantity - 1 }))} aria-label="Decrease quantity"><Icon name="minus" size={15} /></button><span>{line.quantity}</span><button onClick={() => dispatch(quantityChanged({ slug: line.slug, quantity: line.quantity + 1 }))} aria-label="Increase quantity"><Icon name="plus" size={15} /></button></div>
          <strong className="cart-line-total">{formatNaira(line.price * line.quantity)}</strong>
          <button className="remove-line" onClick={() => dispatch(itemRemoved(line.slug))} aria-label={`Remove ${line.name}`}><Icon name="close" size={16} /></button>
        </div>)}
        <Link href="/shop" className="continue-link"><Icon name="chevronLeft" size={16} /> {t("continueShopping")}</Link>
      </div>
      <aside className="summary-card">
        <h2>{t("orderSummary")}</h2>
        <div className="summary-row"><span>{t("subtotal")}</span><strong>{formatNaira(subtotal)}</strong></div>
        <div className="summary-row"><span>{t("deliveryLabel")}</span><strong>{delivery === 0 ? t("free") : formatNaira(delivery)}</strong></div>
        <div className="summary-total"><span>{t("total")}</span><strong>{formatNaira(subtotal + delivery)}</strong></div>
        <Link href="/checkout" className="primary-button full-button">{t("checkout")} <Icon name="arrow" size={18} /></Link>
        <span className="secure-note"><Icon name="lock" size={14} /> {t("securePaystack")}</span>
      </aside>
    </div>}
  </main>;
}

export function CheckoutPage() {
  const dispatch = useDispatch();
  const subtotal = useSelector((state: RootState) => selectCartTotal(state));
  const lines = useSelector((state: RootState) => selectCartLines(state));
  const remoteCartId = useSelector((state: RootState) => state.catalog.remoteCartId);
  const [placed, setPlaced] = useState(false);
  const [slot, setSlot] = useState(1);
  const [quoteError, setQuoteError] = useState("");
  if (placed) return <main className="page-width success-page"><div className="success-orbit"><Icon name="check" size={38} /></div><span className="section-kicker">Order confirmed</span><h1>Thank you, your order is on its way.</h1><p>Your KlemStore order is confirmed and your nearby store is already getting things together.</p><div className="order-number">ORDER KS–{Math.floor(Date.now() / 1000).toString().slice(-6)}</div><Link href="/orders" className="primary-button">Track your order <Icon name="arrow" size={18} /></Link></main>;
  const delivery = deliverySlots[slot].price;
  const placeOrder = async () => { setQuoteError(""); if (remoteCartId) { try { await createCheckoutQuote(remoteCartId); } catch { setQuoteError("The live checkout quote is unavailable, so your order was not submitted."); return; } } setPlaced(true); dispatch(cartCleared()); dispatch(remoteCartCleared()); };
  return <main className="page-width checkout-page">
    <PageHeading title="Checkout" crumbs={[{ label: "Home", href: "/" }, { label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
    <div className="checkout-layout">
      <div className="checkout-form">
        <section className="checkout-section"><div className="checkout-section-heading"><span>1</span><div><h2>Delivery address</h2><p>We&apos;ll deliver to the location you picked.</p></div></div><div className="selected-address"><span className="address-icon"><Icon name="pin" size={20} /></span><div><strong>Ikeja, Lagos</strong><span>12 Adeola Street · Home</span></div><button onClick={() => undefined}>Change</button></div></section>
        <section className="checkout-section"><div className="checkout-section-heading"><span>2</span><div><h2>Delivery time</h2><p>Your nearby store has these windows open.</p></div></div><div className="delivery-options">{deliverySlots.map((item, index) => <button key={item.time} className={slot === index ? "delivery-option selected" : "delivery-option"} onClick={() => setSlot(index)}><span className="radio-mark" /><div><strong>{item.time}</strong><small>{item.note}</small></div><b>{item.price === 0 ? "Free" : formatNaira(item.price)}</b></button>)}</div></section>
        <section className="checkout-section"><div className="checkout-section-heading"><span>3</span><div><h2>Payment</h2><p>Payment is handled securely by Paystack.</p></div></div><div className="payment-option selected"><span className="address-icon"><Icon name="lock" size={20} /></span><div><strong>Card or bank transfer</strong><span>Secure payment via Paystack</span></div><span className="payment-check"><Icon name="check" size={16} /></span></div></section>
      </div>
      <aside className="summary-card checkout-summary">
        <h2>Order summary</h2>
        <div className="checkout-items"><span>{lines.length || 3} items</span><span>{formatNaira(subtotal || 16800)}</span></div>
        <div className="summary-row"><span>Delivery</span><strong>{formatNaira(delivery)}</strong></div>
        <div className="summary-total"><span>Total</span><strong>{formatNaira((subtotal || 16800) + delivery)}</strong></div>
        {quoteError && <p className="form-error">{quoteError}</p>}
        <button className="primary-button full-button" onClick={placeOrder}>Place order <Icon name="arrow" size={18} /></button>
        <span className="secure-note"><Icon name="lock" size={14} /> Your payment details are protected.</span>
      </aside>
    </div>
  </main>;
}

export function AccountPage() {
  const tiles = [
    { href: "/orders", icon: "box", title: "Your orders", copy: "Track a delivery or buy something again." },
    { href: "/favorites", icon: "heart", title: "Saved items", copy: "Products you want to come back to." },
    { href: "/help", icon: "pin", title: "Addresses", copy: "Home, work and other places you ship to." },
    { href: "/plans", icon: "refresh", title: "Repeat plans", copy: "Schedule the things you always reorder." },
  ] as const;
  return <main className="page-width account-page">
    <div className="account-welcome"><div className="account-avatar">A</div><div><span className="section-kicker">My account</span><h1>Hello, Amaka</h1><p>Manage your orders, saved items and delivery details.</p></div></div>
    <div className="account-grid">{tiles.map((tile) => <Link key={tile.title} href={tile.href} className="account-tile"><span className="tile-icon"><Icon name={tile.icon} size={22} /></span><strong>{tile.title}</strong><p>{tile.copy}</p><span className="tile-arrow"><Icon name="arrow" size={18} /></span></Link>)}</div>
  </main>;
}

export function OrdersPage() {
  return <main className="page-width orders-page">
    <PageHeading title="Orders" copy="03 orders in total" crumbs={[{ label: "Account", href: "/account" }, { label: "Orders" }]} />
    <div className="orders-list">
      <div className="order-card current-order"><div className="order-status"><span className="live-dot" /> Out for delivery</div><div className="order-card-main"><div><span className="order-date">Today · 09:42</span><h2>Order KS–824301</h2><p>Nigerian citrus box, Agege bread loaf<br />+ 3 more items</p></div><div className="order-illustration"><Icon name="truck" size={30} /></div></div><div className="order-progress"><span className="progress-done" /><span className="progress-done" /><span className="progress-active" /><span /></div><div className="progress-labels"><span>Confirmed</span><span>Picked</span><span>On the way</span><span>Delivered</span></div><Link href="/help" className="text-link">See delivery details <Icon name="arrow" size={15} /></Link></div>
      <div className="order-card"><div className="order-status muted-status">Delivered · 28 Aug</div><div className="order-card-main"><div><span className="order-date">28 Aug 2026</span><h2>Order KS–810662</h2><p>Nigerian morning roast, Ogbomoso honey<br />+ 4 more items</p></div><strong className="order-total">₦18,400</strong></div><div className="order-card-actions"><button className="outline-button">View order</button><button className="primary-small-button">Buy it again</button></div></div>
    </div>
  </main>;
}

export function FavoritesPage() {
  const saved = useSelector((state: RootState) => state.saved.slugs);
  const activeProducts = useActiveProducts();
  const savedProducts = activeProducts.filter((product) => saved.includes(product.slug));
  return <main className="page-width favorites-page"><PageHeading title="Saved items" copy="Your personal wishlist." crumbs={[{ label: "Home", href: "/" }, { label: "Saved" }]} />{savedProducts.length ? <ProductGrid items={savedProducts} /> : <div className="empty-page saved-empty"><span className="empty-emoji"><Icon name="heart" size={32} /></span><h2>Nothing saved yet</h2><p>Tap the heart on any product to keep it here for later.</p><Link href="/shop" className="primary-button">Browse products <Icon name="arrow" size={18} /></Link></div>}</main>;
}

export function PlansPage() {
  return <main className="page-width plans-page">
    <section className="plans-hero"><div><span className="hero-eyebrow">Repeat plans</span><h1>Never run out of<br />the things you love.</h1><p>Build a schedule around the products you reorder most. We&apos;ll remind you before you run low.</p><button className="light-button">Create a plan <Icon name="arrow" size={18} /></button></div><div className="plans-stack"><div>🥫<span>Monthly staples</span></div><div>☕<span>Morning ritual</span></div><div>🫙<span>Cooking basics</span></div></div></section>
    <section className="plans-list"><SectionTitle title="Popular plans" /><div className="plan-row"><div className="plan-row-art">🍝</div><div><span className="section-kicker">Weeknight</span><h3>15-minute dinners</h3><p>8 pantry staples · every 2 weeks</p></div><button className="outline-button">Add plan</button></div><div className="plan-row"><div className="plan-row-art">🥣</div><div><span className="section-kicker">Mornings</span><h3>Breakfast, sorted</h3><p>6 breakfast favourites · every month</p></div><button className="outline-button">Add plan</button></div></section>
  </main>;
}

export function HelpPage() {
  const faqs = ["How does KlemStore pick my store?", "Can I change my delivery location?", "What happens if something is out of stock?", "How do I track my order?"];
  const [open, setOpen] = useState(0);
  return <main className="page-width help-page"><div className="help-hero"><span className="hero-eyebrow">Help centre</span><h1>How can we help?</h1><p>Find a quick answer or talk to a person on our support team.</p><div className="search-field"><Icon name="search" size={18} /><input placeholder="Search help" aria-label="Search help" /></div></div><div className="help-layout"><div className="faq-list"><h2>Frequently asked questions</h2>{faqs.map((faq, index) => <div className={open === index ? "faq-item open" : "faq-item"} key={faq}><button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{faq}</span><Icon name={open === index ? "minus" : "plus"} size={18} /></button>{open === index && <p>{index === 0 ? "We use your delivery location, availability, store service areas and route time to quietly choose the best nearby store. You see the experience, not the internal hand-off." : index === 1 ? "Absolutely. Tap the delivery location at the top of any page and choose a new address. Your catalogue will update around it." : index === 2 ? "We will never let you check out with a surprise. If a nearby item changes, we suggest the closest alternative before payment." : "Open Orders from your account to see the latest status, delivery window and helpful details."}</p>}</div>)}</div><div className="contact-card"><span className="contact-spark"><Icon name="headset" size={24} /></span><h2>Still need help?</h2><p>Our team is around Monday–Saturday, 8am–8pm.</p><button className="light-button">Start a chat <Icon name="arrow" size={18} /></button></div></div></main>;
}
