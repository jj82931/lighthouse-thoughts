// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./modalSlice.js";
import reportReducer from "./reportSlice.js";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    report: reportReducer,
  },
  // Redux DevTools Extension 활성화 (개발 환경에서 유용)
  devTools: process.env.NODE_ENV !== "production",
});
