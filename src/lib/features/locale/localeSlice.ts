import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Locale } from "../../i18n";

type LocaleState = {
  language: Locale;
};

const initialState: LocaleState = {
  language: "en",
};

export const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    languageChanged: (state, action: PayloadAction<Locale>) => {
      state.language = action.payload;
    },
  },
});

export const { languageChanged } = localeSlice.actions;
