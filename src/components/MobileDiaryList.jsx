// src/components/MobileDiaryList.jsx
import React, { Fragment } from "react"; // Fragment 추가
import { Dialog, Transition } from "@headlessui/react";

// 필요한 props: isOpen, onClose, diaries, listLoading, listError, sortBy, handleSortChange, searchTerm, handleSearchChange, handleDiaryItemClick, selectedDiaryId, handleOpenDeleteModal
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
  loadMoreDiaries, // 더보기 함수 추가
  hasMoreDiaries, // 더보기 가능 여부 추가
  isMoreLoading, // 더보기 로딩 상태 추가
}) {
  return (
    // Transition 컴포넌트로 애니메이션 효과 적용
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* 배경 오버레이 트랜지션 */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        {/* 메인 패널 컨테이너 */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-end text-center">
            {" "}
            {/* 왼쪽 정렬 위해 justify-start */}
            {/* 패널 트랜지션 */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              // --- 수정: translate-x-full (오른쪽 밖) ---
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              // --- 수정: translate-x-full (오른쪽 밖) ---
              leaveTo="opacity-0 translate-x-full"
            >
              {/* 실제 패널 내용 */}
              <Dialog.Panel
                className="w-full max-w-xs transform overflow-hidden rounded-l-lg bg-white 
              dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all h-screen flex flex-col"
              >
                {" "}
                {/* 세로 스크롤 및 높이 설정 */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 
                  dark:text-white flex justify-between items-center"
                >
                  Recent Diaries
                  {/* 닫기 버튼 */}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-200 
                    dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Dialog.Title>
                {/* 정렬 및 검색 UI */}
                <div className="mt-4 mb-4 flex flex-col gap-2">
                  {/* --- Select Box 수정 --- */}
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none" // appearance-none 추가 (기본 화살표 제거 위해)
                    // 기본 화살표를 커스텀 아이콘으로 대체하려면 추가 작업 필요
                  >
                    {/* Option 태그들 추가 */}
                    <option value="createdAtDesc">최신순</option>
                    <option value="createdAtAsc">오래된순</option>
                    <option value="moodScoreDesc">Mood Score 높은 순</option>
                    <option value="moodScoreAsc">Mood Score 낮은 순</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {/* -------------------- */}
                </div>
                {/* 로딩 및 에러 표시 */}
                {listLoading && (
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading list...
                  </p>
                )}
                {listError && <p className="text-red-600">{listError}</p>}
                {/* 일기 목록 (스크롤 가능 영역) */}
                <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                  {" "}
                  {/* 스크롤 영역 */}
                  {/* 로딩/에러 아닐 때만 내용 표시 */}
                  {!listLoading &&
                    !listError &&
                    (diaries.length === 0 ? ( // diaries 배열 길이로 판단
                      <p className="text-gray-500 dark:text-gray-400">
                        Nothing here..
                      </p> // 결과 없음 메시지
                    ) : (
                      // 결과 있으면 목록 렌더링
                      <ul className="space-y-4">
                        {diaries.map(
                          (
                            diary // diaries 배열 사용
                          ) => (
                            <li
                              key={diary.id}
                              onClick={() => {
                                handleDiaryItemClick(diary.id);
                                onClose();
                              }}
                              className={`relative group pb-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md p-2 ${selectedDiaryId === diary.id ? "bg-blue-100 dark:bg-blue-900" : ""}`} // 스타일 클래스 추가
                            >
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {diary.createdAt
                                  ?.toDate()
                                  .toLocaleDateString("ko-KR")}
                              </p>
                              {diary.moodScore !== null && (
                                <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">
                                  Mood: {diary.moodScore}
                                </p>
                              )}
                              <p className="text-base text-gray-800 dark:text-gray-100">
                                {diary.userText?.substring(0, 50)}
                                {diary.userText?.length > 50 ? "..." : ""}
                              </p>
                              {/* 삭제 버튼 */}
                              <button
                                onClick={(e) => {
                                  handleOpenDeleteModal(
                                    diary.id,
                                    e
                                  ); /* onClose(); */
                                }} // 여기서 onClose() 호출 여부 재고려
                                className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                aria-label="Delete diary"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </li>
                          )
                        )}
                      </ul>
                    ))}
                </div>
                {/* 더보기 버튼 */}
                {!listLoading && hasMoreDiaries && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={loadMoreDiaries}
                      disabled={isMoreLoading}
                      className="..."
                    >
                      {isMoreLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default MobileDiaryList;
