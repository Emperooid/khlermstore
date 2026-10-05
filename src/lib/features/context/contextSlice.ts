import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FulfillmentContext = {
  id: string;
  displayLabel: string;
  deliveryFeeMinor: number;
  currency: string;
  expiresAt: string;
};

type ContextState = {
  current: FulfillmentContext | null;
  locationInput: string | null;
  lastResolvedAt: string | null;
};

const initialState: ContextState = {
  current: null,
  locationInput: null,
  lastResolvedAt: null,
};

export const contextSlice = createSlice({
  name: "context",
  initialState,
  reducers: {
    contextReplaced: (state, action: PayloadAction<FulfillmentContext>) => {
      state.current = action.payload;
      state.lastResolvedAt = new Date().toISOString();
    },
    locationInputChanged: (state, action: PayloadAction<string>) => {
      state.locationInput = action.payload;
    },
    contextCleared: (state) => {
      state.current = null;
    },
  },
});

export const { contextReplaced, locationInputChanged, contextCleared } = contextSlice.actions;
