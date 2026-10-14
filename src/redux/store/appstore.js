import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { MainReducer } from "../reducers/ParentReducer/MainReducer";
import { baseApi } from "../../shared/api/baseApi";

const appstore = configureStore({
  reducer: MainReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(appstore.dispatch);

export default appstore;
