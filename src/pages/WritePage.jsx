import React, {
  useEffect,
  useState,
  useMemo,
  Fragment,
  useCallback,
} from "react";
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
import { PlayCircleIcon as RecommendationIcon } from "@heroicons/react/24/solid";
import {
  CodeBracketIcon,
  StarIcon,
  CogIcon,
  ArrowLeftEndOnRectangleIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";

// Redux 관련 훅 및 액션 import
import { useDispatch, useSelector } from "react-redux";
import {
  openUpdateModal,
  closeInfoModal,
  openDeleteModal,
  closeErrorModal,
  openInfoModal,
  openErrorModal,
  resetUpdateConfirmed,
  resetDeleteConfirmed,
  openPersonaDetailModal,
  clearPersonaForConfirmation,
  openRecommendationModal,
} from "../store/modalSlice.js";
// 리포트 관련 아이콘
import { PresentationChartBarIcon } from "@heroicons/react/24/outline";

// 유튜브 검색 import
import { searchYoutubeVideos } from "../services/youtubeApi"; // ✨ 유튜브 검색 함수 import

//페르소나 관련 import
import PersonaSelection from "../components/PersonaSelection";
import { personas as personasDataArray } from "../data/personasData";

// import { id } from "happy-dom/lib/PropertySymbol.js"; //Vite test 용 import

function Writepage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  // --------------------Redux 관련------------------------
  const dispatch = useDispatch(); //useDispatch 훅
  const {
    updateConfirmed,
    deleteConfirmed,
    tempAnalysisData,
    diaryToDeleteId,
    personaForConfirmation,
  } = useSelector((state) => state.modal);
  // -------------------------------------------------------

  const [diaryText, setDiaryText] = useState(""); //일기내용 저장할 상태
  const [analysisResultText, setAnalysisResultText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredDiaryId, setHoveredDiaryId] = useState(null); //호버된 일기 ID 상태 추가

  const [moodScoreDisplay, setMoodScoreDisplay] = useState(null);

  const [diaries, setDiaries] = useState([]);
  const [sortBy, setSortBy] = useState("createdAtDesc"); // 정렬 기준 상태
  const [selectDiary, setSelectDiary] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); //검색어 상태
  const [editing, setEditing] = useState(false); //글 수정 상태
  const [originalDiary, setOriginalDiary] = useState(""); //원본글과 변경된글을 저장하기 위한 상태변수
  const [lastVisibleDiary, setLastVisibleDiary] = useState(null);
  const [checkMorediaries, setCheckMoreDiaries] = useState(false);

  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null); // 목록 로딩 에러
  const [moreLoading, setMoreLoading] = useState(false);
  const [analysisKeywords, setAnalysisKeywords] = useState([]); //ai.js 에서 나온 키워드 저장상태

  // ----------모바일 환경-----------
  const [mobileListOpen, setMobileListOpen] = useState(false);

  // ---  페르소나 관련 상태 ---
  const [selectedPersona, setSelectedPersona] = useState(null);
  //--- Youtube 관련--------------
  const [youtubeRecommendations, setYoutubeRecommendations] = useState([]);
  const [youtubeSearchLoading, setYoutubeSearchLoading] = useState(false);
  const [recommendedCategoryForModal, setRecommendedCategoryForModal] =
    useState(""); // 모달에 전달할 카테고리명

  /******************먼저 선언해야 하는 함수 또는 useEffect***************** */
  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setSelectDiary(null);
    setDiaryText("");
    setAnalysisResultText("");
    setMoodScoreDisplay(null);
    dispatch(closeErrorModal()); // 혹시 열려있을 수 있는 에러 모달 닫기
    setOriginalDiary("");
    setSelectedPersona(null);
  }, [dispatch]);

  const handleActualPersonaSelect = useCallback(
    (personaId) => {
      // ✨ 이미 선택된 페르소나를 다시 "Select"해도 선택이 해제되지 않도록 수정
      if (selectedPersona !== personaId) {
        // ✨ 현재 선택과 다를 때만 새로 선택
        setSelectedPersona(personaId);
      }
      // 만약 personaId가 null (Default AI 선택 등) 이라면 그것도 반영
      if (personaId === null && selectedPersona !== null) {
        setSelectedPersona(null);
      }
      // console.log(
      //   "Persona definitively selected in WritePage:",
      //   personaId || "Default AI"
      // );
    },
    [selectedPersona]
  );
  /******************************************************************** */

  // --- 실제 업데이트 로직 (useCallback으로 감싸고, Redux 상태 사용) ---
  const performUpdateDiary = useCallback(async () => {
    // selectDiary는 로컬 상태, tempAnalysisData는 Redux 상태
    if (!currentUser || !selectDiary || !tempAnalysisData) {
      console.error("Update prerequisites not met:", {
        currentUser,
        selectDiary,
        tempAnalysisData,
      });
      dispatch(resetUpdateConfirmed());
      return;
    }
    setLoading(true);
    dispatch(closeErrorModal());

    const dataToUpdate = {
      userText: diaryText,
      analysisResult: tempAnalysisData.text,
      moodScore: tempAnalysisData.score,
      keywords: tempAnalysisData.keywords || [], // tempAnalysisData에서 keywords 가져와 저장
      personaId: selectedPersona, // 수정 시 페르소나도 함께 업데이트
      updatedAt: serverTimestamp(), // 업데이트 시간 추가가
    };
    try {
      await updateDiaryEntry(currentUser.uid, selectDiary, dataToUpdate);

      setDiaries((prev) =>
        prev.map((d) =>
          d.id === selectDiary
            ? {
                ...d,
                userText: diaryText, // ✨ 수정된 텍스트 반영
                analysisResult: tempAnalysisData.text,
                moodScore: tempAnalysisData.score,
                keywords: tempAnalysisData.keywords || [],
                personaId: selectedPersona,
                updatedAt: new Date(), // Firestore serverTimestamp와는 다르지만, 즉각적인 UI 반영을위해
              }
            : d
        )
      );
      handleCancelEdit();

      dispatch(
        openInfoModal({
          message: "Successfully diary updated on DB.",
          type: "success",
        })
      );
    } catch (error) {
      console.error("Updating error:", error);
      dispatch(openErrorModal(error.message || "Updating error"));
    } finally {
      setLoading(false);
      dispatch(resetUpdateConfirmed());
    }
  }, [
    currentUser,
    selectDiary,
    tempAnalysisData,
    diaryText,
    dispatch,
    handleCancelEdit,
    selectedPersona,
  ]);

  // --- 실제 삭제 로직 (useCallback으로 감싸고, Redux 상태 사용) ---
  const performDeleteDiary = useCallback(async () => {
    // diaryToDeleteId는 Redux 상태
    if (!currentUser || !diaryToDeleteId) {
      console.error("Delete prerequisites not met:", {
        currentUser,
        diaryToDeleteId,
      });
      dispatch(resetDeleteConfirmed());
      return;
    }
    setLoading(true);
    dispatch(closeErrorModal());

    try {
      await deleteDiaryEntry(currentUser.uid, diaryToDeleteId);
      setDiaries((prev) =>
        prev.filter((diary) => diary.id !== diaryToDeleteId)
      );
      if (selectDiary === diaryToDeleteId) {
        handleCancelEdit();
      }

      dispatch(
        openInfoModal({
          message: "Diary has been deleted successfully.",
          type: "success",
        })
      );
    } catch (error) {
      console.error("delete error:", error);
      dispatch(openErrorModal(error.message || "Unknown error deletion error"));
    } finally {
      setLoading(false);
      dispatch(resetDeleteConfirmed());
    }
  }, [currentUser, diaryToDeleteId, selectDiary, dispatch, handleCancelEdit]);
  // -------------------------------------------------------------------

  //********************UseEffect 부분*********************************
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
  // --- 업데이트 확인 상태 감지 useEffect ---
  useEffect(() => {
    if (updateConfirmed) {
      performUpdateDiary();
    }
  }, [updateConfirmed, performUpdateDiary]);

  // --- 삭제 확인 상태 감지 useEffect ---
  useEffect(() => {
    if (deleteConfirmed) {
      performDeleteDiary();
    }
  }, [deleteConfirmed, performDeleteDiary]);

  useEffect(() => {
    if (analysisKeywords.length > 0) {
      console.log(
        "Analysis Keywords for potential recommendations:",
        analysisKeywords
      );
      // TODO: Implement content recommendation logic using these keywords
    }
  }, [analysisKeywords]);

  useEffect(() => {
    if (personaForConfirmation) {
      handleActualPersonaSelect(personaForConfirmation); // 실제 선택 로직 호출
      dispatch(clearPersonaForConfirmation()); // 임시 상태 초기화
    }
  }, [personaForConfirmation, dispatch, handleActualPersonaSelect]);
  //*********************************************************

  // --- 이벤트 핸들러들 ---
  const handleTextChange = (event) => {
    setDiaryText(event.target.value);
  };
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const openMobileList = () => {
    setMobileListOpen(true);
  };
  const closeMobileList = () => {
    setMobileListOpen(false);
  };
  // ----------------------

  const handleAnalyze = async () => {
    const textToAnalyze = diaryText;
    if (!currentUser) {
      dispatch(openErrorModal("Login needed!!"));
      return;
    }

    if (!textToAnalyze.trim()) {
      dispatch(
        openErrorModal("Write diary first! Don't be afraid of expression!")
      );
      return;
    }

    if (selectedPersona === null) {
      dispatch(
        openErrorModal(
          "Please choose an AI Persona to get a tailored analysis."
        )
      ); // ✨ 'Default AI' 버튼 안내 추가
      return;
    }

    dispatch(closeErrorModal()); // 이전 에러 모달 닫기
    setLoading(true);
    setAnalysisResultText("");
    setMoodScoreDisplay(null);
    setAnalysisKeywords([]); // 키워드 초기화
    setSelectDiary(null);
    setEditing(false);
    setOriginalDiary("");
    dispatch(closeErrorModal());
    setYoutubeRecommendations([]);
    setRecommendedCategoryForModal("");
    let fetchedVideos = []; // ✨ videos 대신 fetchedVideos 사용 또는 videos로 통일

    try {
      const {
        analysisText,
        moodScore,
        keywords,
        recommendedCategory,
        youtubeSearchKeywords, // AI가 제공한 유튜브 검색용 키워드
      } = await analyzeAI(textToAnalyze, selectedPersona);

      setAnalysisResultText(analysisText);
      setMoodScoreDisplay(moodScore);
      setAnalysisKeywords(keywords || []); // 키워드 상태 업데이트 (없으면 빈 배열)
      setRecommendedCategoryForModal(recommendedCategory || "Recommendations"); // 모달용 카테고리명 저장

      // --- 유튜브 영상 추천 로직 ---
      if (youtubeSearchKeywords && youtubeSearchKeywords.length > 0) {
        setYoutubeSearchLoading(true);
        try {
          const query = Array.isArray(youtubeSearchKeywords)
            ? youtubeSearchKeywords.join(" ")
            : youtubeSearchKeywords;

          // ✨ searchYoutubeVideos 함수의 결과를 fetchedVideos 변수에 할당
          fetchedVideos = await searchYoutubeVideos(query, 3);
          setYoutubeRecommendations(fetchedVideos || []); // ✨ 로컬 상태에도 즉시 반영

          if (fetchedVideos && fetchedVideos.length > 0) {
            // ✨ 추천 모달을 열기 위한 데이터 준비
            // const currentPersonaInfo = personasDataArray.find(
            //   (p) => p.id === selectedPersona
            // );
            // dispatch(
            //   openRecommendationModal({
            //     // modalSlice.js에 이 액션과 상태가 정의되어 있어야 함
            //     videos: videos,
            //     category: recommendedCategory || "For You", // AI가 준 카테고리명 사용
            //     personaName: currentPersonaInfo
            //       ? currentPersonaInfo.name
            //       : "AI",
            //   })
            // );
          } else {
            console.log("No YouTube videos found for the keywords.");
          }
        } catch (youtubeError) {
          console.error(
            "Failed to fetch YouTube recommendations:",
            youtubeError
          );
          fetchedVideos = [];
          // (선택적) 사용자에게 에러 알림
          // dispatch(openErrorModal("Sorry, an error occurred while fetching video recommendations."));
        } finally {
          setYoutubeSearchLoading(false);
        }
      } else {
        console.log("No YouTube search keywords provided by AI.");
        // (선택적) 키워드가 없어 추천을 못했다는 알림
      }
      // -----------------------------

      const diaryData = {
        userId: currentUser.uid,
        userText: textToAnalyze,
        analysisResult: analysisText,
        createdAt: serverTimestamp(),
        moodScore: moodScore,
        personaId: selectedPersona, // 선택된 페르소나 ID 저장
        keywords: keywords || [], // Firestore에도 키워드 저장
        youtubeRecommendations: fetchedVideos,
        recommendedCategory: recommendedCategory || "", // ✨ AI가 추천한 카테고리명 저장
      };

      const collectionRef = collection(db, "users", currentUser.uid, "diaries");
      const docRef = await addDoc(collectionRef, diaryData);
      console.log("Firestore worked! Document ID:", docRef.id);

      setDiaries((prev) => [
        { id: docRef.id, ...diaryData, createdAt: Date.now() },
        ...prev,
      ]);
      setDiaryText("");
      dispatch(
        openInfoModal({
          message: "Diary is stored successfully in DB.",
          type: "success",
        })
      );
    } catch (err) {
      console.error("Analyzing error:", err);
      dispatch(openErrorModal(err.message || "Analyzing error"));
      fetchedVideos = [];
    } finally {
      setLoading(false);
    }
  };

  // ✨ "추천 보기" 버튼 클릭 시 모달을 여는 함수
  const handleOpenRecommendationModal = () => {
    if (youtubeRecommendations && youtubeRecommendations.length > 0) {
      const currentPersonaInfo = personasDataArray.find(
        (p) => p.id === selectedPersona
      );
      dispatch(
        openRecommendationModal({
          videos: youtubeRecommendations,
          category: recommendedCategoryForModal, // 저장해둔 카테고리명 사용
          personaName: currentPersonaInfo ? currentPersonaInfo.name : "AI",
        })
      );
    } else {
      // 추천 영상이 없을 경우 사용자에게 알림 (선택적)
      dispatch(
        openInfoModal({
          message: "No video recommendations available for this entry yet.",
          type: "info",
        })
      );
    }
  };

  // 다이어리 선택 핸들러
  const handleDiaryClick = (diaryid) => {
    const selectedDiary = diaries.find((diary) => diary.id === diaryid);
    if (selectedDiary) {
      setDiaryText(selectedDiary.userText || "");
      setOriginalDiary(selectedDiary.userText || "");
      setAnalysisResultText(selectedDiary.analysisResult || "");
      setMoodScoreDisplay(
        selectedDiary.moodScore !== undefined ? selectedDiary.moodScore : null
      );
      setSelectDiary(diaryid);
      setSelectedPersona(selectedDiary.personaId || null); // 저장된 페르소나 불러오기
      setEditing(true);
      setYoutubeRecommendations(selectedDiary.youtubeRecommendations || []);
      setRecommendedCategoryForModal(
        selectedDiary.recommendedCategory || "Recommendations"
      );
      dispatch(closeErrorModal()); // 에러 모달 닫기
    } else {
      console.error("Cannot find diary which you selected", diaryid);
    }
  };

  const handleOpenModal = async () => {
    if (!selectDiary) {
      dispatch(openErrorModal("Please select a diary to update."));
      return;
    }
    if (!currentUser) {
      dispatch(openErrorModal("Login required."));
      return;
    }
    const textToUpdate = diaryText;
    if (!textToUpdate.trim()) {
      dispatch(openErrorModal("Diary content cannot be empty."));
      return;
    }
    if (textToUpdate === originalDiary) {
      dispatch(openErrorModal("Content has not been changed."));
      return;
    }
    if (selectedPersona === null) {
      dispatch(openErrorModal("Please choose an AI Persona for re-analysis."));
      return;
    }

    setLoading(true);
    dispatch(closeInfoModal());
    dispatch(closeErrorModal());
    try {
      const {
        analysisText: newAnalysisText,
        moodScore: newMoodScore,
        keywords: newKeywords,
      } = await analyzeAI(diaryText, selectedPersona);
      dispatch(
        openUpdateModal({
          text: newAnalysisText,
          score: newMoodScore,
          keywords: newKeywords || [],
        })
      );
    } catch (error) {
      console.error("Analyzed error on modal:", error);
      dispatch(openErrorModal(error.message || "Re-analyzing error"));
    } finally {
      setLoading(false);
    }
  };

  const openPersonaDetailModalForSelection = (persona) => {
    // ✨ 함수명 변경 및 로직 단순화
    dispatch(
      openPersonaDetailModal(persona) // ✨ 이제 persona 객체만 전달
    );
  };

  // --- handleOpenDeleteModal (삭제 확인 모달 열기 - Redux 액션 디스패치) ---
  const handleOpenDeleteModal = (diaryid, event) => {
    event.stopPropagation();
    dispatch(openDeleteModal(diaryid));
  };
  /* --------------------------- User 프로파일 --------------------------------- */
  // --- handleLogout (Redux 액션 사용) ---
  const handleLogout = async () => {
    console.log("[LOGOUT] handleLogout called");
    try {
      await logout();
      console.log("Firebase logout successful");
      navigate("/");
    } catch (error) {
      console.error("logout error:", error);
      dispatch(openErrorModal("Logout failed. Please try again."));
    }
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

  /* ---------------------------------------------- HTML,jsx ---------------------------------- */
  return (
    // --- 전체 컨테이너: 테마 적용 ---
    <div className="relative flex min-h-screen px-2 sm:px-4 py-6 sm:py-8 gap-4 sm:gap-6 bg-stone-900 text-stone-300 w-full mx-auto">
      {/* 왼쪽: 일기 작성 영역 */}
      <div className="relative w-full lg:w-2/3 xl:w-3/4 bg-stone-800 p-4 sm:p-6 rounded-lg shadow-lg">
        {/* 사용자 메뉴 (스타일 유지 또는 약간 조정) */}
        {currentUser && (
          <div className="absolute top-6 right-6 z-10">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center justify-center w-10 h-10 bg-stone-700 rounded-full hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-amber-500 transition-colors">
                  {currentUser.photoURL ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={currentUser.photoURL}
                      alt="User avatar"
                    />
                  ) : (
                    <span className="text-stone-300 font-semibold text-lg">
                      {currentUser.displayName ? (
                        currentUser.displayName.charAt(0).toUpperCase()
                      ) : (
                        <UserCircleIcon className="h-7 w-7 text-stone-400" />
                      )}
                    </span>
                  )}
                </Menu.Button>
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
                <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-stone-700 rounded-md bg-stone-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  {/* 구독/플랜 정보 */}
                  <div className="px-1 py-1">
                    <div className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-stone-400 cursor-default">
                      <StarIcon className="mr-3 h-5 w-5 text-amber-400" />
                      Current Plan: Free
                    </div>
                  </div>

                  {/* 프로필/로그아웃 */}
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          disabled
                          className={`${
                            active
                              ? "bg-stone-700 text-white"
                              : "text-stone-300"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          <CogIcon className="mr-3 h-5 w-5" />
                          Profile Settings
                        </button>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active
                              ? "bg-stone-700 text-white"
                              : "text-stone-300"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          <ArrowLeftEndOnRectangleIcon className="mr-3 h-5 w-5" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>

                  {/* 개발자/지원 */}
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="YOUR_TWITTER_LINK_HERE"
                          className={`${
                            active
                              ? "bg-stone-700 text-white"
                              : "text-stone-300"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          <CodeBracketIcon className="mr-3 h-5 w-5" />
                          Developer Twitter
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="mailto:YOUR_SUPPORT_EMAIL_HERE"
                          className={`${
                            active
                              ? "bg-stone-700 text-white"
                              : "text-stone-300"
                          } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                        >
                          <EnvelopeIcon className="mr-3 h-5 w-5" />
                          Support Email
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}
        {/* ------------------일기 쓰는부분분------------------------- */}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-5 text-stone-100">
            Write diary
          </h1>
          {/* --text-primary */}
          <p className="text-stone-400 mb-6">What did you think today?</p>
          <div className="flex gap-4 items-start mb-5">
            {/* --- ✨ AI 페르소나 선택 UI (세로 배치) --- */}
            <div className="flex-shrink-0">
              {/* ✨ 아이콘 영역이 줄어들지 않도록 */}
              <PersonaSelection
                personas={personasDataArray}
                selectedPersona={selectedPersona}
                onIconClick={openPersonaDetailModalForSelection} // ✨ 아이콘 클릭 시 모달 열고 콜백 전달
                layoutDirection="vertical" // ✨ 레이아웃 방향을 위한 prop 추가 (선택적)
              />
            </div>
            <textarea
              value={diaryText}
              onChange={handleTextChange}
              placeholder="Write down your thoughts..."
              rows="20"
              disabled={loading}
              className="flex-grow p-4 border border-stone-700 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent 
          bg-stone-700 text-stone-100 placeholder-stone-500 text-base" // --border-primary, --focus-ring-accent, --bg-tertiary, --text-primary, placeholder 색상 조정
            />
          </div>
        </div>
        {/* --- ✨ 버튼 그룹 위치 변경 --- */}
        <div className="mt-auto pt-4 flex gap-3">
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
        </div>
        {/* 분석 결과 표시 */}
        {(analysisResultText || moodScoreDisplay !== null) && !loading && (
          <div className="mt-8 p-5 border border-stone-700 rounded-lg bg-stone-800 shadow-inner">
            <div className="flex justify-between items-start">
              {" "}
              {/* ✨ 제목과 버튼을 같은 줄에 배치 */}
              <h2 className="text-2xl font-semibold mb-4 text-stone-100">
                Result analyzing
              </h2>
              {/* ✨ 추천 보기 버튼 (youtubeRecommendations에 데이터가 있거나, 로딩 중이 아닐 때 표시) */}
              {!youtubeSearchLoading && recommendedCategoryForModal && (
                <div className="mt-4 text-center">
                  {" "}
                  {/* 또는 text-left, text-right */}
                  <button
                    onClick={handleOpenRecommendationModal}
                    className="inline-flex items-center px-4 py-2 border border-amber-500 text-sm font-medium rounded-md shadow-sm text-amber-500 hover:bg-amber-500 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-amber-500 transition-colors duration-150"
                  >
                    <RecommendationIcon className="h-5 w-5 mr-2 -ml-1" />
                    View Recommendations video
                  </button>
                </div>
              )}
              {youtubeSearchLoading && (
                <div className="p-2 -mt-1 -mr-1">
                  <div className="w-5 h-5 border-2 border-stone-500 border-t-amber-500 rounded-full animate-spin"></div>{" "}
                  {/* 간단한 스피너 */}
                </div>
              )}
            </div>

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
      {/* PC 사이드 패널 */}
      <div className="hidden md:flex md:flex-col md:w-2/5 lg:w-1/3 xl:w-1/4 bg-stone-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-5 text-stone-100 flex-shrink-0">
          Recent Diaries
        </h2>
        {/* ✨ 리포트 보기 버튼 추가 */}
        <div className="mb-5 flex-shrink-0">
          <Link
            to="/report"
            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-stone-100 bg-stone-700 hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-800 focus:ring-amber-500 transition-colors"
          >
            <PresentationChartBarIcon className="h-5 w-5 mr-2" />
            View Weekly/Monthly Report
          </Link>
        </div>
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
        <div className="flex-flex-grow overflow-y-auto">
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
                {sortedFilterDiaries.map((diary) => {
                  const personaInfo = diary.personaId
                    ? personasDataArray.find((p) => p.id === diary.personaId)
                    : null;
                  const isEdited =
                    diary.updatedAt &&
                    diary.createdAt &&
                    diary.updatedAt > diary.createdAt + 1000; // 1초 이상 차이날 때 수정으로 간주

                  return (
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
                      {/* ✨ 날짜와 페르소나 아이콘을 함께 표시 */}
                      <div className="flex items-center mb-1">
                        <p className="text-sm text-stone-400 mb-1">
                          {diary.createdAt
                            ? new Date(diary.createdAt).toLocaleDateString(
                                "au-AU"
                              )
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
                            className="w-4 h-4 ml-1.5 rounded-full object-cover" // ✨ 크기 및 마진 조절
                            title={personaInfo.name} // ✨ 호버 시 페르소나 이름 표시 (툴팁)
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
                  );
                })}
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
        {/* MobileDiaryList*/}
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
          hasMoreDiaries={checkMorediaries} // 사용자 정의 상태 변수 사용
          isMoreLoading={moreLoading}
          editing={editing}
          mobileLoading={loading}
          personasData={personasDataArray} // ✨ 페르소나 데이터 전달
        />
        {/* --------------------------- */}
      </div>
    </div>
  );
}

export default Writepage;
