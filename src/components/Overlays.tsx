"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { discountPercent, formatNaira, getProduct } from "../lib/data";
import { itemRemoved, quantityChanged, selectCartCount, selectCartLines, selectCartTotal } from "../lib/features/cart/cartSlice";
import { cartClosed, cartOpened, quickViewClosed, toastDismissed } from "../lib/features/ui/uiSlice";
import type { RootState } from "../lib/store";
import { Icon, Stars } from "./Icons";
import { useActiveProducts, useAddToBag, useCategoryName, categoryOf, useLocaleCopy } from "./hooks";

const FREE_DELIVERY_AT = 15000;

function useLockBody(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [active]);
}

function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onEscape(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onEscape]);
}

export function MiniCart() {
  const { t } = useLocaleCopy();
  const dispatch = useDispatch();
  const open = useSelector((state: RootState) => state.ui.cartOpen);
  const lines = useSelector((state: RootState) => selectCartLines(state));
  const count = useSelector((state: RootState) => selectCartCount(state));
  const subtotal = useSelector((state: RootState) => selectCartTotal(state));
  const close = () => dispatch(cartClosed());
  useLockBody(open);
  useEscape(open, close);
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_AT) * 100));

  return (
    <div className={open ? "minicart open" : "minicart"} aria-hidden={!open}>
      <button className="minicart-scrim" onClick={close} aria-label={t("closeMenu")} tabIndex={open ? 0 : -1} />
      <aside className="minicart-panel" role="dialog" aria-modal="true" aria-label={t("yourBag")}>
        <header className="minicart-head"><h2>{t("yourBag")} <span>{count}</span></h2><button className="icon-button" onClick={close} aria-label={t("closeMenu")} tabIndex={open ? 0 : -1}><Icon name="close" size={20} /></button></header>
        {lines.length > 0 && (
          <div className="shipping-progress mini"><p>{subtotal >= FREE_DELIVERY_AT ? <b>{t("freeDeliveryUnlocked")}</b> : t("addMoreForFree", { amount: formatNaira(FREE_DELIVERY_AT - subtotal) })}</p><span><i style={{ width: `${progress}%` }} /></span></div>
        )}
        <div className="minicart-body">
          {lines.length === 0 ? (
            <div className="minicart-empty"><span><Icon name="bag" size={30} /></span><h3>{t("emptyBag")}</h3><p>{t("emptyBagCopy")}</p><Link href="/shop" className="primary-button" onClick={close}>{t("startShopping")} <Icon name="arrow" size={17} /></Link></div>
          ) : (
            <ul className="minicart-lines">
              {lines.map((line) => (
                <li key={line.slug} className="minicart-line">
                  <Link href={`/product/${line.slug}`} onClick={close} className="minicart-thumb"><img src={line.image} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>{line.emoji}</span></Link>
                  <div className="minicart-info">
                    <Link href={`/product/${line.slug}`} onClick={close}>{line.name}</Link>
                    <small>{line.unit}</small>
                    <div className="minicart-row">
                      <div className="quantity-picker small">
                        <button onClick={() => dispatch(quantityChanged({ slug: line.slug, quantity: line.quantity - 1 }))} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button>
                        <span>{line.quantity}</span>
                        <button onClick={() => dispatch(quantityChanged({ slug: line.slug, quantity: line.quantity + 1 }))} aria-label="Increase quantity"><Icon name="plus" size={14} /></button>
                      </div>
                      <strong>{formatNaira(line.price * line.quantity)}</strong>
                    </div>
                  </div>
                  <button className="remove-line" onClick={() => dispatch(itemRemoved(line.slug))} aria-label={`Remove ${line.name}`}><Icon name="close" size={15} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {lines.length > 0 && (
          <footer className="minicart-foot">
            <div className="summary-total compact"><span>{t("subtotal")}</span><strong>{formatNaira(subtotal)}</strong></div>
            <Link href="/checkout" className="primary-button full-button" onClick={close}>{t("checkout")} <Icon name="arrow" size={17} /></Link>
            <Link href="/cart" className="minicart-link" onClick={close}>{t("viewFullBag")}</Link>
          </footer>
        )}
      </aside>
    </div>
  );
}

export function Toast() {
  const { t } = useLocaleCopy();
  const dispatch = useDispatch();
  const toast = useSelector((state: RootState) => state.ui.toast);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dispatch(toastDismissed()), 4200);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast]);
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span className="toast-thumb"><img src={toast.image} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><i>{toast.emoji}</i></span>
      <span className="toast-copy"><strong><Icon name="check" size={14} /> {t("addedToast")}</strong><small>{toast.name}</small></span>
      <button className="toast-action" onClick={() => dispatch(cartOpened())}>{t("viewBag")}</button>
      <button className="toast-close" onClick={() => dispatch(toastDismissed())} aria-label={t("closeMenu")}><Icon name="close" size={14} /></button>
      <span className="toast-timer" />
    </div>
  );
}

export function QuickView() {
  const { t } = useLocaleCopy();
  const dispatch = useDispatch();
  const categoryName = useCategoryName();
  const slug = useSelector((state: RootState) => state.ui.quickView);
  const activeProducts = useActiveProducts();
  const addToBag = useAddToBag();
  const [quantity, setQuantity] = useState(1);
  const product = slug ? activeProducts.find((item) => item.slug === slug) || getProduct(slug) : undefined;
  const close = () => dispatch(quickViewClosed());
  useLockBody(Boolean(product));
  useEscape(Boolean(product), close);
  useEffect(() => { setQuantity(1); }, [slug]);
  if (!product) return null;
  const discount = discountPercent(product);
  const category = categoryOf(product);
  return (
    <div className="overlay quickview-overlay" role="dialog" aria-modal="true" aria-label={product.name}>
      <button className="overlay-scrim" onClick={close} aria-label={t("closeMenu")} />
      <div className="quickview">
        <button className="close-button" onClick={close} aria-label={t("closeMenu")}><Icon name="close" size={18} /></button>
        <div className="quickview-art"><img src={product.image} alt={product.name} />{discount > 0 && <span className="flag flag-sale">-{discount}%</span>}</div>
        <div className="quickview-copy">
          <span className="section-kicker">{category ? categoryName(category.slug, category.name) : product.category}</span>
          <h2>{product.name}</h2>
          {product.rating && <span className="product-rating"><Stars rating={product.rating} size={15} /><b>{product.rating.toFixed(1)}</b><small>({product.reviews} {t("reviews")})</small></span>}
          <div className="detail-price-row"><strong className="detail-price">{formatNaira(product.price)}</strong>{discount > 0 && <s>{formatNaira(product.compareAt!)}</s>}</div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-actions compact">
            <div className="quantity-picker"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Icon name="minus" size={16} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Icon name="plus" size={16} /></button></div>
            <button className="primary-button add-detail" onClick={(event) => { addToBag(product, event.currentTarget, quantity); close(); }}><Icon name="bag" size={18} /> {t("addToBag")}</button>
          </div>
          <Link href={`/product/${product.slug}`} className="delivery-note" onClick={close}>{t("detailsTab")} <Icon name="arrow" size={15} /></Link>
        </div>
      </div>
    </div>
  );
}

export function ScrollTop() {
  const { t } = useLocaleCopy();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <button className={visible ? "scroll-top visible" : "scroll-top"} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={t("backToTop")} tabIndex={visible ? 0 : -1}><Icon name="arrow" size={18} style={{ transform: "rotate(-90deg)" }} /></button>;
}
