import type { Product } from "./data";

const apiBaseUrl = (process.env.NEXT_PUBLIC_KLEMSTORE_API_BASE_URL || "").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_KLEMSTORE_TENANT_ID || "";
const accessToken = process.env.NEXT_PUBLIC_KLEMSTORE_ACCESS_TOKEN || "";

export type CoreCatalogItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitCode: string;
  priceMinor: number;
  currency: string;
};

export type CoreFulfillmentContext = {
  contextId: string | null;
  outcome: "SELECTED" | "UNSERVICEABLE" | "PROVIDER_ERROR";
  displayLabel?: string | null;
  currency?: string | null;
  expiresAt: string;
  selectedStoreId?: string | null;
};

export type CoreCheckoutQuote = {
  checkoutId: string;
  cartId: string;
  contextId: string;
  currency: string;
  totalMinor: number;
  quoteHash: string;
  expiresAt: string;
};

export function isCoreApiConfigured() {
  return Boolean(apiBaseUrl && tenantId);
}

export function getGuestSession() {
  if (typeof window === "undefined") return "klemstore-server-guest-session";
  const key = "klemstore-guest-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = `guest-${crypto.randomUUID()}-klemstore`;
  window.localStorage.setItem(key, next);
  return next;
}

async function request<T>(path: string, init: RequestInit = {}, idempotent = false): Promise<T> {
  if (!isCoreApiConfigured()) throw new Error("Klemstore Core API is not configured");
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Tenant-ID", tenantId);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (idempotent) headers.set("Idempotency-Key", crypto.randomUUID());
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Core API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function resolveFulfillmentContext(latitude: number, longitude: number) {
  return request<CoreFulfillmentContext>("/v1/fulfillment-contexts/resolve", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude, locationSource: "MANUAL", deliveryMode: "DELIVERY" }),
  }, true);
}

export function listCatalog(contextId: string) {
  return request<CoreCatalogItem[]>(`/v1/catalog?contextId=${encodeURIComponent(contextId)}&limit=100`);
}

export function createCart(contextId: string, currency: string) {
  return request<{ cartId: string; contextId: string | null; currency: string }>("/v1/carts", {
    method: "POST",
    headers: { "X-Guest-Session": getGuestSession() },
    body: JSON.stringify({ contextId, currency }),
  });
}

export function addCartItem(cartId: string, variantId: string, quantity = 1) {
  return request<{ itemId: string; quantity: number; selectionHash: string }>(`/v1/carts/${cartId}/items`, {
    method: "POST",
    headers: { "X-Guest-Session": getGuestSession() },
    body: JSON.stringify({ variantId, quantity }),
  });
}

export function createCheckoutQuote(cartId: string) {
  return request<CoreCheckoutQuote>("/v1/checkouts", {
    method: "POST",
    headers: { "X-Guest-Session": getGuestSession() },
    body: JSON.stringify({ cartId }),
  });
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function catalogItemToProduct(item: CoreCatalogItem): Product {
  const category = "KlemStore catalogue";
  const price = item.currency === "NGN" ? item.priceMinor / 100 : item.priceMinor;
  return {
    productId: item.productId,
    variantId: item.variantId,
    slug: slugify(item.productName) || item.sku.toLowerCase(),
    name: item.productName,
    category,
    price,
    unit: item.variantName || item.unitCode,
    emoji: "📦",
    image: "/klemstore-logo.png",
    tone: "blue",
    description: `${item.productName} from the KlemStore catalogue.`,
    note: `${item.sku} · ${item.unitCode}`,
  };
}
