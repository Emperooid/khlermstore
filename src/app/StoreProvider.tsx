"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";
import { cartHydrated } from "@/lib/features/cart/cartSlice";
import { savedHydrated } from "@/lib/features/saved/savedSlice";

const CART_KEY = "klemstore-cart";
const SAVED_KEY = "klemstore-saved";

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  // Restore the bag and wishlist after hydration, then keep them saved on change.
  useEffect(() => {
    const store = storeRef.current!;
    const cart = readJson<ReturnType<typeof store.getState>["cart"]["lines"]>(CART_KEY);
    const saved = readJson<string[]>(SAVED_KEY);
    if (Array.isArray(cart) && cart.length) store.dispatch(cartHydrated(cart));
    if (Array.isArray(saved) && saved.length) store.dispatch(savedHydrated(saved));
    let lastCart = store.getState().cart.lines;
    let lastSaved = store.getState().saved.slugs;
    return store.subscribe(() => {
      const state = store.getState();
      try {
        if (state.cart.lines !== lastCart) { lastCart = state.cart.lines; window.localStorage.setItem(CART_KEY, JSON.stringify(lastCart)); }
        if (state.saved.slugs !== lastSaved) { lastSaved = state.saved.slugs; window.localStorage.setItem(SAVED_KEY, JSON.stringify(lastSaved)); }
      } catch {
        // Storage can be unavailable in private or restricted webviews; the session still works.
      }
    });
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
