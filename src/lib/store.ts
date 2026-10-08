import { configureStore } from "@reduxjs/toolkit";
import { contextSlice } from "./features/context/contextSlice";
import { cartSlice } from "./features/cart/cartSlice";
import { savedSlice } from "./features/saved/savedSlice";
import { localeSlice } from "./features/locale/localeSlice";
import { catalogSlice } from "./features/catalog/catalogSlice";
import { uiSlice } from "./features/ui/uiSlice";

export type RootState = {
  context: ReturnType<typeof contextSlice.reducer>;
  cart: ReturnType<typeof cartSlice.reducer>;
  saved: ReturnType<typeof savedSlice.reducer>;
  locale: ReturnType<typeof localeSlice.reducer>;
  catalog: ReturnType<typeof catalogSlice.reducer>;
  ui: ReturnType<typeof uiSlice.reducer>;
};

export const makeStore = (preloadedState?: RootState) =>
  configureStore({
    reducer: {
      context: contextSlice.reducer,
      cart: cartSlice.reducer,
      saved: savedSlice.reducer,
      locale: localeSlice.reducer,
      catalog: catalogSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState,
    // Server data belongs in Next.js request fetches or a client cache layer;
    // Redux is reserved for shared, mutable client state.
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
