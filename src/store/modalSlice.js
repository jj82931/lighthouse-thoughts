import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isUpdateModalOpen: false,
  isDeleteModalOpen: false,
  isInfoModalOpen: false,
  isErrorModalOpen: false,
  modalMessage: "",
  modalType: "info", // 'info', 'success', 'error' 등
  diaryToDeleteId: null, // 삭제할 일기 ID
  tempAnalysisData: { text: "", score: null }, // 수정 시 임시 분석 데이터
  updateConfirmed: false, //확인상태 변수들
  deleteConfirmed: false,
  isPersonaDetailModalOpen: false, // 페르소나 상세 모달 열림 상태
  personaDetailData: null, // 표시할 페르소나 데이터 (객체)
  personaForConfirmation: null, // 모달에서 최종 선택된 페르소나 ID 임시 저장
};

const modalSlice = createSlice({
  name: "modal", // 슬라이스 이름
  initialState, // 초기 상태
  // 상태를 변경하는 리듀서 함수들 정의
  reducers: {
    // 수정 확인 모달 열기 (재분석 데이터 포함)
    openUpdateModal: (state, action) => {
      state.isUpdateModalOpen = true;
      state.tempAnalysisData = action.payload; // payload: { text, score }
      state.updateConfirmed = false; // 모달 열 때 확인 상태 초기화
    },
    closeUpdateModal: (state) => {
      state.isUpdateModalOpen = false;
    },
    // 업데이트 확인 액션/리듀서 추가 ---
    confirmUpdate: (state) => {
      state.updateConfirmed = true;
      state.isUpdateModalOpen = false; // 확인 시 모달도 닫음
    },
    resetUpdateConfirmed: (state) => {
      // 작업 완료 후 리셋
      state.updateConfirmed = false;
      state.tempAnalysisData = { text: "", score: null }; // 임시 데이터도 여기서 초기화
    },
    //-------------------------
    // 삭제 확인 모달 열기 (삭제할 ID 포함)
    openDeleteModal: (state, action) => {
      state.isDeleteModalOpen = true;
      state.diaryToDeleteId = action.payload; // payload: diaryId
      state.deleteConfirmed = false; // 모달 열 때 확인 상태 초기화
    },
    closeDeleteModal: (state) => {
      state.isDeleteModalOpen = false;
    },
    // --- 삭제 확인 액션/리듀서 추가 ---
    confirmDelete: (state) => {
      state.deleteConfirmed = true;
      state.isDeleteModalOpen = false; // 확인 시 모달도 닫음
    },
    resetDeleteConfirmed: (state) => {
      // 작업 완료 후 리셋
      state.deleteConfirmed = false;
      state.diaryToDeleteId = null; // 삭제 대상 ID도 여기서 초기화
    },
    // ---------------- 삭제 확인 액션/리듀서 end---------------
    // 정보/성공 모달 열기
    openInfoModal: (state, action) => {
      const { message = "", type = "info" } = action.payload || {};
      state.isInfoModalOpen = true;
      state.modalMessage = message;
      state.modalType = type;
    },
    closeInfoModal: (state) => {
      state.isInfoModalOpen = false;
      state.modalMessage = "";
      state.modalType = "info";
    },
    // 에러 모달 열기
    openErrorModal: (state, action) => {
      state.isErrorModalOpen = true;
      state.modalMessage = action.payload; // payload: errorMessage
      state.modalType = "error";
    },
    closeErrorModal: (state) => {
      state.isErrorModalOpen = false;
      state.modalMessage = "";
      state.modalType = "error";
    },
    // 모든 모달 닫기 (선택적 유틸리티)
    closeAllModals: (state) => {
      state.isUpdateModalOpen = false;
      state.isDeleteModalOpen = false;
      state.isInfoModalOpen = false;
      state.isErrorModalOpen = false;
      state.modalMessage = "";
      state.diaryToDeleteId = null;
      state.tempAnalysisData = { text: "", score: null };
      state.updateConfirmed = false;
      state.deleteConfirmed = false;
    },
    // --- 페르소나 상세 모달 관련 리듀서 ---
    openPersonaDetailModal: (state, action) => {
      state.isPersonaDetailModalOpen = true;
      state.personaDetailData = action.payload; // payload는 이제 persona 객체
    },
    closePersonaDetailModal: (state) => {
      state.isPersonaDetailModalOpen = false;
      state.personaDetailData = null; // 닫을 때 데이터 초기화
    },
    // ✨ 모달에서 페르소나 선택을 확정하는 새 액션
    confirmPersonaSelectionFromModal: (state, action) => {
      state.personaForConfirmation = action.payload; // payload: 선택된 persona.id
      state.isPersonaDetailModalOpen = false; // 모달 닫기
      state.personaDetailData = null;
    },
    // ✨ WritePage에서 personaForConfirmation을 처리한 후 초기화하는 액션
    clearPersonaForConfirmation: (state) => {
      state.personaForConfirmation = null;
    },
    // ------------------------------------
  },
});

// 각 리듀서 함수에 해당하는 액션 생성자(Action Creator)들을 export
export const {
  openUpdateModal,
  closeUpdateModal,
  confirmUpdate,
  resetUpdateConfirmed, // 추가
  openDeleteModal,
  closeDeleteModal,
  confirmDelete,
  resetDeleteConfirmed, // 추가
  openInfoModal,
  closeInfoModal,
  openErrorModal,
  closeErrorModal,
  closeAllModals,
  /*********** 페르소나 **************/
  openPersonaDetailModal,
  closePersonaDetailModal,
  confirmPersonaSelectionFromModal,
  clearPersonaForConfirmation,
  /*********************************/
} = modalSlice.actions;

// 슬라이스의 리듀서를 export (스토어 설정에 필요)
export default modalSlice.reducer;
