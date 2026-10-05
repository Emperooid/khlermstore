import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SavedState = { slugs: string[] };

export const savedSlice = createSlice({
  name: "saved",
  initialState: { slugs: [] } as SavedState,
  reducers: {
    savedToggled: (state, action: PayloadAction<string>) => {
      state.slugs = state.slugs.includes(action.payload)
        ? state.slugs.filter((slug) => slug !== action.payload)
        : [...state.slugs, action.payload];
    },
  },
});

export const { savedToggled } = savedSlice.actions;
