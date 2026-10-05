import type { Product } from "./data";

const apiBaseUrl = (process.env.NEXT_PUBLIC_KLEMSTORE_API_BASE_URL || "").replace(/\/$/, "");
const tenantId = process.env.NEXT_PUBLIC_KLEMSTORE_TENANT_ID || "";
const configuredAccessToken = process.env.NEXT_PUBLIC_KLEMSTORE_ACCESS_TOKEN || "";
const accessTokenKey = "klemstore-customer-access-token";
const refreshTokenKey = "klemstore-customer-refresh-token";

export type CustomerProfile = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  locale?: string;
  status?: string;
};

export type CustomerAuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  customer: CustomerProfile;
};

export type CustomerRegisterRequest = {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  locale?: string;
  marketingConsent?: boolean;
};

function readToken(key: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) || fallback;
}

function storeTokens(auth: Pick<CustomerAuthResponse, "accessToken" | "refreshToken">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(accessTokenKey, auth.accessToken);
  window.localStorage.setItem(refreshTokenKey, auth.refreshToken);
}

function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(accessTokenKey);
  window.localStorage.removeItem(refreshTokenKey);
}

export function hasCustomerSession() {
  return Boolean(readToken(accessTokenKey, configuredAccessToken));
}

export function clearCustomerSession() {
  clearTokens();
}

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

async function refreshCustomerSession() {
  const refreshToken = readToken(refreshTokenKey);
  if (!refreshToken) return false;
  const headers = new Headers({ "Content-Type": "application/json", "X-Tenant-ID": tenantId });
  const response = await fetch(`${apiBaseUrl}/v1/customer-auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) {
    clearTokens();
    return false;
  }
  storeTokens(await response.json() as CustomerAuthResponse);
  return true;
}

async function request<T>(path: string, init: RequestInit = {}, idempotent = false, retryAuth = true): Promise<T> {
  if (!isCoreApiConfigured()) throw new Error("Klemstore Core API is not configured");
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Tenant-ID", tenantId);
  const currentAccessToken = readToken(accessTokenKey, configuredAccessToken);
  if (currentAccessToken) headers.set("Authorization", `Bearer ${currentAccessToken}`);
  if (idempotent) headers.set("Idempotency-Key", crypto.randomUUID());
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers, cache: "no-store" });
  if (response.status === 401 && retryAuth && !path.startsWith("/v1/customer-auth/")) {
    if (await refreshCustomerSession()) return request<T>(path, init, idempotent, false);
  }
  if (!response.ok) throw new Error(`Core API request failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function customerRegister(payload: CustomerRegisterRequest) {
  return request<CustomerAuthResponse>("/v1/customer-auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((auth) => { storeTokens(auth); return auth; });
}

export function customerLogin(email: string, password: string) {
  return request<CustomerAuthResponse>("/v1/customer-auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).then((auth) => { storeTokens(auth); return auth; });
}

export function customerMe() {
  return request<CustomerProfile>("/v1/customer-auth/me");
}

export function customerLogout(allSessions = false) {
  return request<void>("/v1/customer-auth/logout", {
    method: "POST",
    body: JSON.stringify({ allSessions }),
  }).finally(clearTokens);
}

export function customerChangePassword(currentPassword: string, newPassword: string) {
  return request<CustomerAuthResponse>("/v1/customer-auth/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then((auth) => { storeTokens(auth); return auth; });
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
