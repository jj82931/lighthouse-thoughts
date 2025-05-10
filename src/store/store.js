// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
// 나중에 만들 모달 슬라이스의 리듀서를 import 합니다.
// import modalReducer from '../features/modal/modalSlice'; // 예시 경로

export const store = configureStore({
  reducer: {
    // 여기에 앱의 다른 상태 슬라이스들의 리듀서를 추가합니다.
    // modal: modalReducer, // 예시: 모달 상태 리듀서 등록
    // 다른 리듀서들...
  },
  // Redux DevTools Extension 활성화 (개발 환경에서 유용)
  devTools: process.env.NODE_ENV !== "production",
});
