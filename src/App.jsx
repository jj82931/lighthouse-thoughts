import React, { Fragment } from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import Writepage from "./pages/WritePage";
import ProtectedRoute from "./components/ProtectionRoute";
import { useSelector, useDispatch } from "react-redux";
import {
  closeUpdateModal,
  confirmUpdate,
  closeDeleteModal,
  confirmDelete,
  closeInfoModal,
  closeErrorModal,
} from "./store/modalSlice.js";

function App() {
  const {
    isUpdateModalOpen,
    isDeleteModalOpen,
    isInfoModalOpen,
    isErrorModalOpen,
    modalMessage,
    modalType,
    tempAnalysisData,
  } = useSelector((state) => state.modal);

  const dispatch = useDispatch();

  const handleCloseInfoModalInApp = () => dispatch(closeInfoModal());
  const handleCloseErrorModalInApp = () => dispatch(closeErrorModal());
  console.log(
    "App.jsx - InfoModal Message:",
    modalMessage,
    "isOpen:",
    isInfoModalOpen
  );
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <Writepage></Writepage>
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
      {/* 수정 확인 모달 */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-stone-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-stone-700">
            <h3 className="text-xl font-semibold mb-4 text-stone-100">
              Confirm Update
            </h3>
            <p className="mb-4 text-stone-300">
              The following analysis and mood score will be saved based on your
              updated text. Do you want to proceed?
            </p>
            <div className="mb-4 p-3 border border-stone-700 rounded bg-stone-900">
              <p className="font-semibold text-stone-200">New Mood Score:</p>
              <p className="mb-2 text-stone-100">
                {tempAnalysisData.score !== null
                  ? `${tempAnalysisData.score} / 100`
                  : "N/A"}
              </p>
              <p className="font-semibold text-stone-200">New Analysis:</p>
              <p className="text-sm whitespace-pre-wrap text-stone-100">
                {tempAnalysisData.text || "Analysis not available."}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => dispatch(closeUpdateModal())}
                className="px-4 py-2 rounded bg-stone-600 hover:bg-stone-700 text-stone-100"
              >
                Cancel
              </button>{" "}
              <button
                onClick={() => dispatch(confirmUpdate())}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Confirm Update
              </button>{" "}
              {/* --positive-bg, hover, --text-on-accent */}
            </div>
          </div>
        </div>
      )}
      {/* 에러 모달 */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-stone-800 p-6 rounded-lg shadow-xl max-w-sm w-full border border-stone-700">
            <h3 className="text-lg font-semibold mb-4 text-red-500">Warning</h3>{" "}
            {/* --error */}
            <p className="mb-4 text-stone-200">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseErrorModalInApp}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Close
              </button>{" "}
              {/* --destructive-bg, hover, --text-on-destructive-button */}
            </div>
          </div>
        </div>
      )}
      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
          <div className="bg-stone-800 p-6 rounded-lg shadow-xl max-w-sm w-full border border-stone-700">
            <h3 className="text-lg font-semibold mb-4 text-stone-100">
              Confirm Deletion
            </h3>
            <p className="mb-6 text-stone-300">
              Are you sure you want to delete this diary entry? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => dispatch(closeDeleteModal())}
                className="px-4 py-2 rounded bg-stone-600 hover:bg-stone-700 text-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => dispatch(confirmDelete())}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 정보/성공 모달 */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-stone-800 p-6 rounded-lg shadow-xl max-w-sm w-full border border-stone-700">
            <h3
              className={`text-lg font-semibold mb-4 ${modalType === "success" ? "text-emerald-500" : "text-sky-500"}`}
            >
              {modalType === "success" ? "Success" : "Information"}
            </h3>
            {console.log("InfoModal Render, message:", modalMessage)}
            <p className="mb-4 text-stone-200">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseInfoModalInApp}
                className={`px-4 py-2 rounded text-white ${modalType === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-sky-600 hover:bg-sky-700"}`}
              >
                OK
              </button>{" "}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
