// src/components/MobileDiaryList.jsx
import React, { Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
// 아이콘 추가 (닫기 버튼용)
import { XMarkIcon } from "@heroicons/react/24/outline";

function MobileDiaryList({
  isOpen,
  onClose,
  diaries,
  listLoading,
  listError,
  sortBy,
  handleSortChange,
  searchTerm,
  handleSearchChange,
  handleDiaryItemClick,
  selectedDiaryId,
  handleOpenDeleteModal,
  loadMoreDiaries,
  hasMoreDiaries,
  isMoreLoading,
  mobileLoading,
  personasData,
}) {
  const handleClick = (diaryId) => {
    if (mobileLoading) return;
    handleDiaryItemClick(diaryId);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {/* 배경 오버레이 */}
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />{" "}
          {/* 반투명 검정 유지 */}
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-end text-center">
            {/* 오른쪽 정렬 */}
            <TransitionChild
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              {/* --- 패널 스타일 수정 (따뜻한 어두운 테마) --- */}
              <DialogPanel
                className="w-full max-w-xs transform overflow-hidden rounded-l-lg bg-stone-800 p-6 text-left 
              align-middle shadow-xl transition-all h-screen flex flex-col text-stone-300"
              >
                {/* 배경, 기본 텍스트 */}
                <DialogTitle
                  as="h3"
                  className="text-xl font-semibold leading-6 text-stone-100 flex justify-between items-center mb-5"
                >
                  Recent Diaries
                  {/* 닫기 버튼 */}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-stone-400 hover:bg-stone-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-stone-800"
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </DialogTitle>
                {/* 정렬 및 검색 UI */}
                <div className="mb-5 flex flex-col gap-3 flex-shrink-0">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="p-2 border border-stone-700 rounded-md bg-stone-700 text-stone-100 focus:ring-2 
                    focus:ring-amber-500 focus:border-transparent appearance-none w-full"
                  >
                    <option value="createdAtDesc">Latest</option>
                    <option value="createdAtAsc">Oldest</option>
                    <option value="moodScoreDesc">Hightest Mood Score</option>
                    <option value="moodScoreAsc">Lowest Mood Score</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border border-stone-700 rounded-md w-full bg-stone-700 text-stone-100 placeholder-stone-500 
                    focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                {/* 로딩 및 에러 표시 */}
                {listLoading && (
                  <p className="text-stone-400 text-center py-4">
                    Loading list...
                  </p>
                )}{" "}
                {listError && (
                  <p className="text-red-500 text-center py-4">{listError}</p>
                )}{" "}
                {/* 일기 목록 (스크롤 가능 영역) */}
                <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                  {" "}
                  {/* 스크롤 영역 */}
                  {!listLoading &&
                    !listError &&
                    (diaries.length === 0 ? (
                      <p className="text-stone-500 text-center py-4">
                        {searchTerm
                          ? "No diaries found matching search."
                          : "Nothing here.."}
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {diaries.map((diary) => {
                          // ✨ 해당 일기의 페르소나 정보 찾기
                          const personaInfo = diary.personaId
                            ? personasData.find((p) => p.id === diary.personaId) // ✨ prop으로 받은 personasData 사용
                            : null;
                          const isEdited =
                            diary.updatedAt &&
                            diary.createdAt &&
                            diary.updatedAt > diary.createdAt + 1000; // 수정 여부 확인

                          return (
                            <li
                              key={diary.id}
                              onClick={() => handleClick(diary.id)}
                              className={`
                              ${mobileLoading ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}
                              relative group pb-3 border-b border-stone-700 last:border-b-0 rounded-md p-3 transition-colors duration-150
                              ${selectedDiaryId === diary.id ? "bg-amber-600 bg-opacity-40" : ""}
                              ${!mobileLoading ? "cursor-pointer hover:bg-stone-700" : ""}
                            `}
                            >
                              {/* ✨ 날짜와 페르소나 아이콘을 함께 표시 */}
                              <div className="flex items-center mb-1">
                                <p className="text-sm text-stone-400 mb-1">
                                  {diary.createdAt
                                    ? new Date(
                                        diary.createdAt
                                      ).toLocaleDateString("au-AU")
                                    : "N/A"}
                                  {/* 수정됨 표시 */}
                                  {isEdited && (
                                    <span className="ml-1 text-xs text-stone-500">
                                      (edited)
                                    </span>
                                  )}
                                </p>
                                {/* ✨ 페르소나 아이콘 표시 */}
                                {personaInfo && personaInfo.icon && (
                                  <img
                                    src={personaInfo.icon}
                                    alt={`${personaInfo.name} icon`}
                                    className="w-4 h-4 ml-1.5 rounded-full object-cover"
                                    title={personaInfo.name}
                                  />
                                )}
                              </div>

                              {diary.moodScore !== null && (
                                <p className="text-sm font-semibold mb-1 text-stone-200">
                                  Mood: {diary.moodScore}
                                </p>
                              )}
                              <p className="text-base text-stone-300">
                                {diary.userText?.substring(0, 50)}
                                {diary.userText?.length > 50 ? "..." : ""}
                              </p>
                              {/* 삭제 버튼 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (mobileLoading) return;
                                  handleOpenDeleteModal(diary.id, e);
                                }}
                                className={`
                                absolute top-2 right-2 p-1 transition-opacity focus:opacity-100
                                ${
                                  mobileLoading
                                    ? "opacity-0 pointer-events-none"
                                    : "text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                }
                              `}
                                aria-label="Delete diary"
                              >
                                <XMarkIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />{" "}
                                {/* 아이콘 변경 */}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ))}
                </div>
                {/* ➕ --- 더보기 버튼 추가 --- */}
                {!listLoading && hasMoreDiaries && (
                  <div className="mt-auto pt-4 text-center flex-shrink-0">
                    <button
                      onClick={loadMoreDiaries}
                      disabled={isMoreLoading || mobileLoading}
                      className={`px-4 py-2 rounded text-sm font-medium 
                        ${isMoreLoading || mobileLoading ? "bg-stone-700 text-stone-400 cursor-not-allowed" : "bg-stone-700 hover:bg-stone-600 text-stone-200"}`}
                    >
                      {isMoreLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </DialogPanel>
              {/* ------------------------------------------ */}
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default MobileDiaryList;
