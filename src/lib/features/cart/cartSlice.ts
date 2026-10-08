import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../data";

export type CartLine = {
  slug: string;
  name: string;
  price: number;
  unit: string;
  emoji: string;
  image?: string;
  tone: string;
  quantity: number;
};

type CartState = { lines: CartLine[] };

const initialState: CartState = { lines: [] };

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    itemAdded: (state, action: PayloadAction<Product>) => {
      const existing = state.lines.find((line) => line.slug === action.payload.slug);
      if (existing) {
        existing.quantity += 1;
        return;
      }
      state.lines.push({ ...action.payload, quantity: 1 });
    },
    itemRemoved: (state, action: PayloadAction<string>) => {
      state.lines = state.lines.filter((line) => line.slug !== action.payload);
    },
    quantityChanged: (state, action: PayloadAction<{ slug: string; quantity: number }>) => {
      const line = state.lines.find((item) => item.slug === action.payload.slug);
      if (!line) return;
      if (action.payload.quantity <= 0) {
        state.lines = state.lines.filter((item) => item.slug !== action.payload.slug);
      } else {
        line.quantity = action.payload.quantity;
      }
    },
    cartCleared: (state) => {
      state.lines = [];
    },
    cartHydrated: (state, action: PayloadAction<CartLine[]>) => {
      state.lines = action.payload;
    },
  },
});

export const { itemAdded, itemRemoved, quantityChanged, cartCleared, cartHydrated } = cartSlice.actions;

export const selectCartLines = (state: { cart: CartState }) => state.cart.lines;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.lines.reduce((total, line) => total + line.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.lines.reduce((total, line) => total + line.price * line.quantity, 0);
