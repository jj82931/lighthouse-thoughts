import React, { useEffect, useState, useMemo, Fragment } from "react";
import { analyzeAI } from "../services/ai";
import { useAuth } from "../contexts/Auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  getUserDiaries,
  updateDiaryEntry,
  deleteDiaryEntry,
} from "../services/firestoredb.js";
import MobileDiaryList from "../components/MobileDiaryList.jsx";
import { Menu, Transition, MenuItem, MenuButton } from "@headlessui/react"; //
import {
  CodeBracketIcon,
  StarIcon,
  CogIcon,
  ArrowLeftEndOnRectangleIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// import { id } from "happy-dom/lib/PropertySymbol.js"; //Vite test 용 import

function Writepage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [diaryText, setDiaryText] = useState(""); //일기내용 저장할 상태
  const [analysisResultText, setAnalysisResultText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredDiaryId, setHoveredDiaryId] = useState(null); //호버된 일기 ID 상태 추가

  const [moodScoreDisplay, setMoodScoreDisplay] = useState(null);

  const [diaries, setDiaries] = useState([]);
  const [sortBy, setSortBy] = useState("createdAtDesc"); // 정렬 기준 상태
  const [selectDiary, setSelectDiary] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); //검색어 상태
  const [editing, setEditing] = useState(false); //글 수정 상태
  const [originalDiary, setOriginalDiary] = useState(""); //원본글과 변경된글을 저장하기 위한 상태변수
  const [diaryToDelete, setDiaryToDelete] = useState(null); // 삭제할 일기 ID 저장
  const [lastVisibleDiary, setLastVisibleDiary] = useState(null);
  const [checkMorediaries, setCheckMoreDiaries] = useState(false);

  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null); // 목록 로딩 에러
  const [moreLoading, setMoreLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false); //모달 열림/닫힘 상태
  const [tempAnalysis, setTempAnalysis] = useState({ text: "", score: null }); //모달에 표시할 임시 데이터 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); //삭제 모달 상태변수
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    message: "",
    type: "info",
  }); //setstatus 대체할 모달달
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  const [mobileListOpen, setMobileListOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setListLoading(true);
      setListError(null);
      setDiaries([]);
      setLastVisibleDiary(null);
      setCheckMoreDiaries(true);

      getUserDiaries(currentUser.uid, 10)
        .then(({ diaries: fetchedDiaries, lastVisible }) => {
          setDiaries(fetchedDiaries);
          setLastVisibleDiary(lastVisible); // 마지막 문서 저장
          setCheckMoreDiaries(fetchedDiaries.length === 10); // 가져온 개수가 요청 개수와 같으면 더 있을 가능성 있음
        })
        .catch((error) => {
          console.error("List loading Error occured :", error);
          setListError("List is not able to load from DB.");
          checkMorediaries(false); // 에러 시 더보기 없음
        })
        .finally(() => {
          setListLoading(false);
        });
      console.log(currentUser);
    } else {
      setDiaries([]);
      setListLoading(false);
      setLastVisibleDiary(null);
      checkMorediaries(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleTextChange = (event) => {
    // textarea 내용이 변경될 때 호출될 함수
    setDiaryText(event.target.value); // 입력된 값으로 diaryText 상태 업데이트
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResultText("");
    setMoodScoreDisplay(null);
    setSelectDiary(null);
    setEditing(false);
    setOriginalDiary("");

    try {
      const currentDiaryText = diaryText; // 현재 입력된 텍스트를 변수에 저장
      const { analysisText, moodScore } = await analyzeAI(currentDiaryText);

      setAnalysisResultText(analysisText);
      setMoodScoreDisplay(moodScore); // Mood Score 상태 업데이트!
      setInfoModal({
        isOpen: true,
        message: "Diary is stored successfully in DB.",
        type: "success",
      });

      const diaryData = {
        userId: currentUser.uid, // 사용자 UID 저장
        userText: currentDiaryText, // 사용자가 입력한 일기 내용 (필드 이름 확인!)
        analysisResult: analysisText, // AI 분석 결과
        createdAt: serverTimestamp(), // 서버 시간 기준으로 생성 시간 저장
        moodScore: moodScore,
      };
      const collectionRef = collection(db, "users", currentUser.uid, "diaries");
      const docRef = await addDoc(collectionRef, diaryData);
      console.log("Firestore worked! Documenmt ID:", docRef.id);

      // 로컬상태 업데이트
      const newDiaryEntry = {
        id: docRef.id,
        ...diaryData,
        createdAt: Date.now(),
      };
      // 기존 diaries 배열의 맨 앞에 새 일기 추가 (최신순 정렬 가정)
      setDiaries((prevDiaries) => [newDiaryEntry, ...prevDiaries]);
      setDiaryText("");
    } catch (Error) {
      console.error("Analyzing error:", Error);
      setErrorModal({
        isOpen: true,
        message: Error.message || "Analyzing error",
      });
    } finally {
      setLoading(false);
    }
  };
  // 다이어리 선택 핸들러
  const handleDiaryClick = (diaryid) => {
    const selectedDiary = diaries.find((diary) => diary.id === diaryid);

    if (selectedDiary) {
      setDiaryText(selectedDiary.userText || ""); // userText가 없을 경우 대비
      setOriginalDiary(selectedDiary.userText || "");
      setAnalysisResultText(selectedDiary.analysisResult || ""); // analysisResult가 없을 경우 대비
      // moodScore가 0일 수도 있으므로 undefined 체크
      setMoodScoreDisplay(
        selectedDiary.moodScore !== undefined ? selectedDiary.moodScore : null
      );
      setSelectDiary(diaryid);
      setEditing(true); //리스트에서 글 선택시 수정모드로 진입입

      setError(null);
    } else {
      console.error("Cannot find diary which you selected", diaryid);
    }
  };
  // 검색어 변경 핸들러 추가
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  // cancel 버튼 핸들러
  const handleCancelEdit = () => {
    setEditing(false);
    setSelectDiary(null);
    setDiaryText("");
    setAnalysisResultText("");
    setMoodScoreDisplay(null);
    setError(null);
  };

  // update 후에 DB 업데이트 핸들러
  const handleUpdateDiary = async () => {
    setModalOpen(false); // 모달 닫기
    setLoading(true); // 로딩 시작
    setError(null);

    try {
      const updatedData = {
        userText: diaryText,
        analysisResult: tempAnalysis.text,
        moodScore: tempAnalysis.score,
        // updatedAt: serverTimestamp() // firestoreService에서 추가됨
      };

      await updateDiaryEntry(currentUser.uid, selectDiary, updatedData);
      setInfoModal({
        isOpen: true,
        message: "Successfully diary updated on DB.",
        type: "success",
      });
      setDiaries((prevDiaries) =>
        prevDiaries.map((diary) =>
          diary.id === selectDiary
            ? { ...diary, ...updatedData, updatedAt: Date.now() }
            : diary
        )
      );
      setEditing(false);
      setSelectDiary(null);
      setDiaryText("");
      setAnalysisResultText("");
      setMoodScoreDisplay(null);
      setTempAnalysis({ text: "", score: null }); // 임시 데이터 초기화
    } catch (error) {
      console.error("Updating error:", error);
      setError(error.message || "Updating error");
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!diaryToDelete || !currentUser) return;
    setDeleteModalOpen(false); // 모달 닫기
    setLoading(true); // 로딩 시작 (버튼 비활성화 등)
    setError(null);

    try {
      await deleteDiaryEntry(currentUser.uid, diaryToDelete);
      setInfoModal({
        isOpen: true,
        message: "Diary has been deleted successfully.",
        type: "success",
      });
      //로컬 diaries 상태에서도 해당 항목 제거
      setDiaries((prevDiaries) =>
        prevDiaries.filter((diary) => diary.id !== diaryToDelete)
      );
      if (selectDiary === diaryToDelete) {
        // 만약 삭제한 일기가 현재 선택/수정 중인 일기였다면 상태 초기화
        handleCancelEdit(); // 수정 취소 함수 재활용
      }
    } catch (error) {
      console.error("delete error:", error);
      setError(error.message || "Unknown error deletion error");
    } finally {
      setLoading(false); // 로딩 종료
      setDiaryToDelete(null); // 삭제 대상 ID 초기화
    }
  };

  // --- 정렬 변경 핸들러 ---
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // ------ 리스트 더보기(more) 핸들러-----
  const loadMoreDiaries = async () => {
    if (!currentUser || !lastVisibleDiary || moreLoading) {
      return;
    }
    setMoreLoading(true);
    setListError(null);
    try {
      const { diaries: newDiaries, lastVisible } = await getUserDiaries(
        currentUser.uid,
        10,
        lastVisibleDiary
      );
      setDiaries((prevDiaries) => [...prevDiaries, ...newDiaries]);
      setLastVisibleDiary(lastVisible);
      setCheckMoreDiaries(newDiaries === 10);
    } catch (error) {
      console.error("List more loading error: ", error);
      setListError("Error loading more diaries.");
    } finally {
      setMoreLoading(false);
    }
  };

  // ---- 클라이언트측 정렬 및 필터링 ----
  const sortedFilterDiaries = useMemo(() => {
    let result = diaries.filter((diary) =>
      diary.userText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      switch (sortBy) {
        case "createdAtAsc":
          // Timestamp 비교 시 toMillis() 사용 권장
          return (a.createdAt || 0) - (b.createdAt || 0);
        case "moodScoreDesc":
          // moodScore가 null일 경우 맨 뒤로 보내기 (예시)
          return (b.moodScore ?? -1) - (a.moodScore ?? -1);
        case "moodScoreAsc":
          // moodScore가 null일 경우 맨 뒤로 보내기 (예시)
          return (a.moodScore ?? 101) - (b.moodScore ?? 101);
        case "createdAtDesc":
        default:
          return (b.createdAt || 0) - (a.createdAt || 0);
      }
    });
    return result;
  }, [diaries, searchTerm, sortBy]);

  /* ---------------------------------------------- 모달함수---------------------------------- */
  // 모달 여는 함수, 에러모달까지 같이 처리함함
  const handleOpenModal = async () => {
    // 1. 일기가 선택되었는지 확인 (수정 모드 확인)
    if (!selectDiary) {
      setErrorModal({
        isOpen: true,
        message: "Please select a diary to update.",
      });
      return;
    }
    // 2. 로그인 상태 확인
    if (!currentUser) {
      setErrorModal({ isOpen: true, message: "Login required." });
      return;
    }
    // 3. 내용이 비어있는지 확인
    if (!diaryText.trim()) {
      setErrorModal({
        isOpen: true,
        message: "Diary content cannot be empty.",
      });
      return;
    }
    // 4. 내용이 변경되었는지 확인
    if (diaryText === originalDiary) {
      setErrorModal({ isOpen: true, message: "Content has not been changed." });
      return;
    }

    // 모달을 열기 전에 AI 재분석 실행 근데 모달 안에서 할 수도 있음
    setLoading(true); // 로딩 표시
    setError(null);
    setInfoModal({ isOpen: false, message: "", type: "info" });

    try {
      // 임시 상태에 새로운 분석 결과 저장
      const { analysisText: newAnalysisText, moodScore: newMoodScore } =
        await analyzeAI(diaryText);
      console.log("AI 재분석 점수 (newMoodScore):", newMoodScore);

      setTempAnalysis({ text: newAnalysisText, score: newMoodScore });
      setModalOpen(true); // 분석 완료 후 모달 열기
    } catch (error) {
      console.error("Analayzed error on modal:", error);
      setError(error.message || "Re-analayzing error");
    } finally {
      setLoading(false);
    }
  };
  //삭제 모달 열기 함수
  const handleOpenDeleteModal = (diaryid, event) => {
    event.stopPropagation();
    setDiaryToDelete(diaryid);
    setDeleteModalOpen(true);
    console.log("setDeleteModalOpen(true) called. diaryToDelete:", diaryid); // 확인용 로그
  };
  // 모달 닫는 함수
  const handleCloseModal = () => {
    setModalOpen(false);
    setTempAnalysis({ text: "", score: null }); // 임시 데이터 초기화
  };
  // 에러 모달 닫기 함수
  const closeErrorModal = () => {
    setErrorModal({ isOpen: false, message: "" });
  };
  // 삭제모달 닫기 핸들러
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDiaryToDelete(null);
  };
  // setstatus 변수 대체하는 모달 닫기 함수
  const closeInfoModal = () => {
    setInfoModal({ isOpen: false, message: "", type: "info" });
  };
  /* --------------------------- User 프로파일 --------------------------------- */
  const handleLogout = async () => {
    console.log("handleLogout function called!");
    try {
      await logout();
      console.log("Firebase logout successful");
      navigate("/");
    } catch (error) {
      console.error("logout error:", error);
      setErrorModal({
        isOpen: true,
        message: "Logout failed. Please try again.",
      });
    }
  };
  /* ---------------------------------------------- 모바일 UI---------------------------------- */
  // 모바일 사이드 일기리스트 열기함수
  const openMobileList = () => {
    setMobileListOpen(true);
  };
  // 모바일 사이드 일기리스트 닫기함수
  const closeMobileList = () => {
    setMobileListOpen(false);
  };
  /* ---------------------------------------------- HTML,jsx ---------------------------------- */
  return (
    // --- 전체 컨테이너: 테마 적용 ---
    <div className="relative flex min-h-screen px-2 sm:px-4 py-6 sm:py-8 gap-4 sm:gap-6 bg-stone-900 text-stone-300 w-full mx-auto">
      {" "}
      {/* --bg-primary, --text-secondary */}
      {/* 왼쪽: 일기 작성 영역 */}
      <div className="relative w-full lg:w-2/3 xl:w-3/4 bg-stone-800 p-4 sm:p-6 rounded-lg shadow-lg">
        {" "}
        {/* --bg-secondary */}
        {/* 사용자 메뉴 (스타일 유지 또는 약간 조정) */}
        {currentUser && (
          <div className="absolute top-6 right-6 z-10">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="flex items-center justify-center w-10 h-10 bg-stone-700 rounded-full hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-amber-500 transition-colors">
                  {" "}
                  {/* --bg-tertiary, hover, --focus-ring-accent */}
                  {currentUser.photoURL ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={currentUser.photoURL}
                      alt="User avatar"
                    />
                  ) : (
                    <span className="text-stone-300 font-semibold text-lg">
                      {" "}
                      {/* --text-secondary */}
                      {currentUser.displayName ? (
                        currentUser.displayName.charAt(0).toUpperCase()
                      ) : (
                        <UserCircleIcon className="h-7 w-7 text-stone-400" />
                      )}{" "}
                      {/* --text-tertiary */}
                    </span>
                  )}
                </MenuButton>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItem
                  as="div"
                  className="absolute right-0 mt-2 w-64 origin-top-right divide-y 
                  divide-stone-700 rounded-md bg-stone-800 shadow-lg ring-1 
                  ring-black ring-opacity-5 focus:outline-none"
                >
                  {/* 구독/플랜 정보 */}
                  <div className="px-1 py-1">
                    <MenuItem disabled as="div">
                      <div
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm 
                      text-stone-400 cursor-default"
                      >
                        {" "}
                        {/* --text-tertiary */}
                        <StarIcon
                          className="mr-3 h-5 w-5 text-amber-400"
                          aria-hidden="true"
                        />{" "}
                        {/* --accent-secondary */}
                        Current Plan: Free
                      </div>
                    </MenuItem>
                  </div>
                  {/* 프로필/로그아웃 */}
                  <div className="px-1 py-1">
                    <MenuItem as="div">
                      {({ focus }) => (
                        <button
                          disabled
                          className={`${focus ? "bg-stone-700 text-white" : "text-stone-300"} 
                          group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          {" "}
                          <CogIcon className="mr-3 h-5 w-5" /> Profile
                          Settings{" "}
                        </button>
                      )}{" "}
                      {/* --bg-tertiary, --text-primary, --text-secondary */}
                    </MenuItem>
                    <MenuItem as={Fragment}>
                      {({ focus }) => (
                        <button
                          onClick={handleLogout}
                          className={`${focus ? "bg-stone-700 text-white" : "text-stone-300"} 
                          group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          {" "}
                          <ArrowLeftEndOnRectangleIcon className="mr-3 h-5 w-5" />{" "}
                          Logout{" "}
                        </button>
                      )}
                    </MenuItem>
                  </div>
                  {/* 개발자/지원 */}
                  <div className="px-1 py-1">
                    <MenuItem as="div">
                      {({ focus }) => (
                        <a
                          href="YOUR_TWITTER_LINK_HERE"
                          /* ... */ className={`${focus ? "bg-stone-700 text-white" : "text-stone-300"} 
                          group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          {" "}
                          <CodeBracketIcon className="mr-3 h-5 w-5" /> Developer
                          Twitter{" "}
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem as="div">
                      {({ focus }) => (
                        <a
                          href="mailto:YOUR_SUPPORT_EMAIL_HERE"
                          className={`${focus ? "bg-stone-700 text-white" : "text-stone-300"} 
                          group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          {" "}
                          <EnvelopeIcon className="mr-3 h-5 w-5" /> Support
                          Email{" "}
                        </a>
                      )}
                    </MenuItem>
                  </div>
                </MenuItem>
              </Transition>
            </Menu>
          </div>
        )}
        {/* ------------------일기 쓰는부분분------------------------- */}
        <h1 className="text-3xl font-bold mb-5 text-stone-100">
          Write diary
        </h1>{" "}
        {/* --text-primary */}
        <p className="text-stone-400 mb-6">What did you think today?</p>{" "}
        {/* --text-tertiary */}
        <textarea
          value={diaryText}
          onChange={handleTextChange}
          placeholder="Write down your thoughts..."
          rows="20"
          disabled={loading}
          className="w-full p-4 border border-stone-700 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent 
          bg-stone-700 text-stone-100 placeholder-stone-500 text-base" // --border-primary, --focus-ring-accent, --bg-tertiary, --text-primary, placeholder 색상 조정
        />
        <div className="mt-5 flex gap-3">
          {editing ? (
            <>
              <button
                onClick={handleOpenModal}
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-70 ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500" // Amber 색상 적용
                }`}
              >
                {loading ? "Checking..." : "Update Diary"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-6 py-2 rounded-md bg-stone-600 hover:bg-stone-700 text-stone-100 focus:outline-none focus:ring-2 
                focus:ring-stone-500 focus:ring-opacity-50" // --neutral-bg, hover, --text-on-neutral-button, --focus-ring-neutral
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-70 ${
                // --text-on-accent
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500" // --accent-primary, hover, focus-ring
              }`}
            >
              {loading ? "Analyzing..." : "Analyze my thoughts"}
            </button>
          )}
        </div>
        {/* 상태 메시지, 커스텀 모달때문에 이제 안써도 될건데..위에 뭘 선언했는지 기억안남.. */}
        {error && <p className="mt-3 text-red-600">{error}</p>}
        {/* 분석 결과 표시 */}
        {(analysisResultText || moodScoreDisplay !== null) && !loading && (
          <div className="mt-8 p-5 border border-stone-700 rounded-lg bg-stone-800 shadow-inner">
            {" "}
            {/* --border-primary, --bg-secondary */}
            <h2 className="text-2xl font-semibold mb-4 text-stone-100">
              {" "}
              {/* --text-primary */}
              Result analyzing
            </h2>
            {moodScoreDisplay !== null && (
              <p className="font-bold text-lg mb-3 text-stone-200">
                {" "}
                {/* --text-secondary 와 primary 사이 */}
                Mood Score: {moodScoreDisplay} / 100
              </p>
            )}
            {analysisResultText && (
              <div className="text-stone-300 whitespace-pre-wrap leading-relaxed">
                {" "}
                {/* --text-secondary */}
                {analysisResultText}
              </div>
            )}
          </div>
        )}
      </div>
      {/* 모바일용 '목록 보기' 버튼 (780px 미만에서 보임임) */}
      <button
        onClick={openMobileList}
        // --- 클래스 수정: 아이콘 버튼 스타일, 위치 조정 ---
        className="block md:hidden fixed top-4 right-4 z-40 p-2 bg-stone-700 
        text-stone-300 rounded-full shadow-lg hover:bg-stone-600 focus:outline-none focus:ring-2 
        focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900" // 배경/텍스트 색상, 포커스 오프셋 조정
        aria-label="Open diary list"
      >
        {/* Heroicons의 Bars3Icon 사용 예시 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      {/* 오른쪽: 사이드 패널 */}
      <div className="hidden md:flex md:flex-col md:w-2/5 lg:w-1/3 xl:w-1/4 bg-stone-800 p-6 rounded-lg shadow-lg">
        {" "}
        {/* --bg-secondary */}
        <h2 className="text-2xl font-bold mb-5 text-stone-100 flex-shrink-0">
          {" "}
          {/* --text-primary */}
          Recent Diaries
        </h2>
        {/* 정렬 및 검색 UI */}
        <div className="mb-5 flex flex-col sm:flex-row gap-3 flex-shrink-0 items-center">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="p-2 border border-stone-700 rounded-md bg-stone-700 text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none w-full sm:w-32" // --border-primary, --bg-tertiary, --text-primary, --focus-ring-accent
          >
            <option value="createdAtDesc">최신순</option>
            <option value="createdAtAsc">오래된순</option>
            <option value="moodScoreDesc">Mood Score 높은 순</option>
            <option value="moodScoreAsc">Mood Score 낮은 순</option>
          </select>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border border-stone-700 rounded-md flex-grow min-w-0 bg-stone-700 
            text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            // --border-primary, --bg-tertiary, --text-primary, placeholder 색상 조정, --focus-ring-accent
          />
        </div>
        {/* 로딩 및 에러 표시 */}
        {listLoading && (
          <p className="text-stone-400 text-center py-4">Loading list...</p>
        )}{" "}
        {/* --text-tertiary */}
        {listError && (
          <p className="text-red-500 text-center py-4">{listError}</p>
        )}{" "}
        {/* 일기 목록 영역 */}
        <div className="flex-grow">
          {" "}
          {/* 높이 채우기 */}
          {/* 로딩 및 에러 아닐 때만 렌더링 */}
          {!listLoading &&
            !listError &&
            // 필터링/정렬된 결과 길이 확인
            (sortedFilterDiaries.length === 0 ? (
              // 결과 없음 메시지
              <p className="text-stone-500 text-center py-4">
                {searchTerm
                  ? "No diaries found matching your search."
                  : "No diaries found."}
              </p>
            ) : (
              // 결과 있으면 목록 렌더링
              <ul className="space-y-4">
                {sortedFilterDiaries.map((diary) => (
                  // --- li 요소 수정: onMouseEnter/Leave 추가, group 제거 가능 ---
                  <li
                    key={diary.id}
                    onClick={() => !loading && handleDiaryClick(diary.id)}
                    onMouseEnter={() => setHoveredDiaryId(diary.id)} // 마우스 올리면 ID 저장
                    onMouseLeave={() => setHoveredDiaryId(null)} // 마우스 벗어나면 null
                    className={`relative pb-3 border-b border-stone-700 last:border-b-0 cursor-pointer
                      hover:bg-stone-700 rounded-md p-3 transition-colors duration-150
                      ${selectDiary === diary.id ? "bg-amber-900 bg-opacity-30" : ""}
                      ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-700"}`}
                  >
                    {/* 목록 아이템 내용 (변경 없음) */}
                    <p className="text-sm text-stone-400 mb-1">
                      {diary.createdAt
                        ? new Date(diary.createdAt).toLocaleDateString("au-AU")
                        : "N/A"}
                    </p>
                    {diary.moodScore !== null && (
                      <p className="text-sm font-semibold mb-1 text-stone-200">
                        Mood: {diary.moodScore}
                      </p>
                    )}
                    <p className="text-base text-stone-300">
                      {diary.userText?.substring(0, 50)}
                      {diary.userText?.length > 50 ? "..." : ""}
                    </p>

                    {/* --- 삭제 버튼 수정: 표시 조건 변경 --- */}
                    <button
                      onClick={(e) =>
                        !loading && handleOpenDeleteModal(diary.id, e)
                      } // 로딩 중 클릭 방지
                      disabled={loading} // 버튼 자체 비활성화
                      // group-hover 대신 hoveredDiaryId 상태로 opacity 제어
                      className={`absolute top-2 right-2 p-1 text-stone-500 hover:text-red-500 transition-opacity 
                        duration-150 focus:opacity-100 
                        ${
                          // 로딩 중이거나, 호버되지 않았으면 숨김 (클릭도 방지)
                          loading || hoveredDiaryId !== diary.id
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100" // 로딩 중 아니고 호버되었으면 보임
                        }`}
                      aria-label="Delete diary"
                    >
                      {/* SVG 아이콘 (변경 없음) */}
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
                    {/* ------------------------------------ */}
                  </li>
                ))}
              </ul>
            ))}
        </div>
        {/* '더보기' 버튼 */}
        {!listLoading && checkMorediaries && (
          <div className="mt-auto pt-4 text-center flex-shrink-0">
            <button
              onClick={loadMoreDiaries}
              disabled={moreLoading}
              className={`px-4 py-2 rounded text-sm font-medium ${
                moreLoading
                  ? "bg-stone-700 text-stone-400 cursor-not-allowed" // --bg-tertiary, --text-tertiary
                  : "bg-stone-700 hover:bg-stone-600 text-stone-200" // --bg-tertiary, hover, --text-secondary 와 primary 사이
              }`}
            >
              {moreLoading ? "Loading more..." : "Load More"}
            </button>
          </div>
        )}
        {/* Tailwind 커스텀 모달  */}
        {/* 수정 확인 모달 */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-stone-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-stone-700">
              {" "}
              {/* --bg-secondary, --border-primary */}
              <h3 className="text-xl font-semibold mb-4 text-stone-100">
                Confirm Update
              </h3>{" "}
              {/* --text-primary */}
              <p className="mb-4 text-stone-300">
                {" "}
                {/* --text-secondary */}
                The following analysis and mood score will be saved based on
                your updated text. Do you want to proceed?
              </p>
              <div className="mb-4 p-3 border border-stone-700 rounded bg-stone-900">
                {" "}
                {/* --border-primary, --bg-primary */}
                <p className="font-semibold text-stone-200">New Mood Score:</p>
                <p className="mb-2 text-stone-100">
                  {tempAnalysis.score !== null
                    ? `${tempAnalysis.score} / 100`
                    : "N/A"}
                </p>
                <p className="font-semibold text-stone-200">New Analysis:</p>
                <p className="text-sm whitespace-pre-wrap text-stone-100">
                  {tempAnalysis.text || "Analysis not available."}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded bg-stone-600 hover:bg-stone-700 text-stone-100"
                >
                  Cancel
                </button>{" "}
                {/* --neutral-bg, hover, --text-on-neutral-button */}
                <button
                  onClick={handleUpdateDiary}
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
        {errorModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-stone-800 p-6 rounded-lg shadow-xl max-w-sm w-full border border-stone-700">
              <h3 className="text-lg font-semibold mb-4 text-red-500">
                Warning
              </h3>{" "}
              {/* --error */}
              <p className="mb-4 text-stone-200">{errorModal.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={closeErrorModal}
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
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
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
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 rounded bg-stone-600 hover:bg-stone-700 text-stone-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 정보/성공 모달 */}
        {infoModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-stone-800 p-6 rounded-lg shadow-xl max-w-sm w-full border border-stone-700">
              <h3
                className={`text-lg font-semibold mb-4 ${infoModal.type === "success" ? "text-emerald-500" : "text-sky-500"}`}
              >
                {" "}
                {/* --success, --info */}
                {infoModal.type === "success" ? "Success" : "Information"}
              </h3>
              <p className="mb-4 text-stone-200">{infoModal.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={closeInfoModal}
                  className={`px-4 py-2 rounded text-white ${infoModal.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-sky-600 hover:bg-sky-700"}`}
                >
                  OK
                </button>{" "}
                {/* --positive-bg, --info-bg */}
              </div>
            </div>
          </div>
        )}
        {/* MobileDiaryList 컴포넌트 렌더링 및 props 전달 --- */}
        <MobileDiaryList
          isOpen={mobileListOpen}
          onClose={closeMobileList}
          diaries={sortedFilterDiaries}
          listLoading={listLoading}
          listError={listError}
          sortBy={sortBy}
          handleSortChange={handleSortChange}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          // MobileDiaryList 내부에서 메뉴를 닫도록 수정
          handleDiaryItemClick={(diaryId) => {
            handleDiaryClick(diaryId); // 기존 함수 호출
            closeMobileList(); // 메뉴 닫기 함수 호출
          }}
          selectedDiaryId={selectDiary} // 사용자 정의 상태 변수 사용
          // MobileDiaryList 내부에서 메뉴를 닫도록 수정 (선택 사항)
          handleOpenDeleteModal={(diaryId, event) => {
            handleOpenDeleteModal(diaryId, event); // 기존 함수 호출
            // closeMobileList(); // 필요 시 주석 해제
          }}
          loadMoreDiaries={loadMoreDiaries}
          checkMorediaries={checkMorediaries} // 사용자 정의 상태 변수 사용
          isMoreLoading={moreLoading}
        />
        {/* --------------------------- */}
      </div>
    </div>
  );
}

export default Writepage;
