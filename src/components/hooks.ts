"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { categories, products, type Product } from "../lib/data";
import { translate, type TranslationKey } from "../lib/i18n";
import { addCartItem } from "../lib/coreApi";
import { itemAdded } from "../lib/features/cart/cartSlice";
import { toastShown } from "../lib/features/ui/uiSlice";
import type { RootState } from "../lib/store";

export function useLocaleCopy() {
  const locale = useSelector((state: RootState) => state.locale.language);
  return { locale, t: (key: TranslationKey, values?: Record<string, string>) => translate(locale, key, values) };
}

export function useActiveProducts() {
  const remoteProducts = useSelector((state: RootState) => state.catalog.items);
  return remoteProducts?.length ? remoteProducts : products;
}

const categoryKeys: Record<string, TranslationKey> = {
  women: "catWomen",
  men: "catMen",
  kids: "catKids",
  shoes: "catShoes",
  "home-living": "catHome",
  "kitchen-dining": "catKitchen",
  beauty: "catBeauty",
  electronics: "electronics",
  sports: "catSports",
  accessories: "catAccessories",
  "toys-games": "catToys",
  pets: "catPets",
  gifts: "catGifts",
  groceries: "catGroceries",
};

export function useCategoryName() {
  const { t } = useLocaleCopy();
  return (slug: string, fallback: string) => (categoryKeys[slug] ? t(categoryKeys[slug]) : fallback);
}

export const categoryOf = (product: Pick<Product, "category">) => categories.find((item) => item.name === product.category);

/** Animates a thumbnail from the product image to the bag icon in the header. */
export function flyToCart(source: Element | null, imageUrl: string) {
  if (!source || typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  const target = targets.find((element) => element.getBoundingClientRect().width > 0);
  if (!target) return;
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = 56;
  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  Object.assign(dot.style, {
    position: "fixed", zIndex: "300", left: `${from.left + from.width / 2 - size / 2}px`, top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`, height: `${size}px`, borderRadius: "50%", backgroundImage: `url("${imageUrl}")`, backgroundSize: "cover", backgroundPosition: "center",
    boxShadow: "0 12px 28px rgba(23,33,59,.35)", border: "3px solid #fff", pointerEvents: "none",
  });
  document.body.appendChild(dot);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = dot.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 70}px) scale(.8)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.18)`, opacity: 0.2 },
    ],
    { duration: 780, easing: "cubic-bezier(.5,0,.2,1)" },
  );
  animation.onfinish = () => dot.remove();
  animation.oncancel = () => dot.remove();
}

/** Adds a product to the bag, mirrors it to the Core API cart, shows a toast and flies the image to the bag icon. */
export function useAddToBag() {
  const dispatch = useDispatch();
  const remoteCartId = useSelector((state: RootState) => state.catalog.remoteCartId);
  return useCallback(
    (product: Product, source?: Element | null, quantity = 1) => {
      for (let index = 0; index < quantity; index += 1) {
        dispatch(itemAdded(product));
        if (remoteCartId && product.variantId) void addCartItem(remoteCartId, product.variantId).catch(() => undefined);
      }
      dispatch(toastShown({ slug: product.slug, name: product.name, image: product.image, emoji: product.emoji }));
      flyToCart(source ?? null, product.image);
    },
    [dispatch, remoteCartId],
  );
}

/** Adds `in-view` once the element scrolls into view; honours reduced motion. */
export function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, shown] as const;
}
