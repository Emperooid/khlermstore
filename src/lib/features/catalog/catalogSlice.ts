import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../data";

type CatalogState = {
  items: Product[] | null;
  status: "idle" | "loading" | "ready" | "error";
  contextId: string | null;
  error: string | null;
  remoteCartId: string | null;
};

const initialState: CatalogState = { items: null, status: "idle", contextId: null, error: null, remoteCartId: null };

export const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    catalogLoading: (state, action: PayloadAction<string>) => { state.status = "loading"; state.contextId = action.payload; state.items = null; state.error = null; },
    catalogLoaded: (state, action: PayloadAction<{ contextId: string; items: Product[] }>) => { state.status = "ready"; state.contextId = action.payload.contextId; state.items = action.payload.items; state.error = null; },
    catalogFailed: (state, action: PayloadAction<string>) => { state.status = "error"; state.error = action.payload; },
    remoteCartOpened: (state, action: PayloadAction<string>) => { state.remoteCartId = action.payload; },
    remoteCartCleared: (state) => { state.remoteCartId = null; },
  },
});

export const { catalogLoading, catalogLoaded, catalogFailed, remoteCartOpened, remoteCartCleared } = catalogSlice.actions;
