import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastState = { id: number; slug: string; name: string; image: string; emoji: string };

type UiState = {
  cartOpen: boolean;
  toast: ToastState | null;
  quickView: string | null;
};

const initialState: UiState = { cartOpen: false, toast: null, quickView: null };

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    cartOpened: (state) => {
      state.cartOpen = true;
      state.toast = null;
    },
    cartClosed: (state) => {
      state.cartOpen = false;
    },
    toastShown: (state, action: PayloadAction<Omit<ToastState, "id">>) => {
      state.toast = { ...action.payload, id: Date.now() };
    },
    toastDismissed: (state) => {
      state.toast = null;
    },
    quickViewOpened: (state, action: PayloadAction<string>) => {
      state.quickView = action.payload;
    },
    quickViewClosed: (state) => {
      state.quickView = null;
    },
  },
});

export const { cartOpened, cartClosed, toastShown, toastDismissed, quickViewOpened, quickViewClosed } = uiSlice.actions;
