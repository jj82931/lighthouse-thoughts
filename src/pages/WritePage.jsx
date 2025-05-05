import React, {useEffect, useState, useMemo} from "react";
import { analyzeAI } from "../services/ai";
import { useAuth } from "../contexts/Auth";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { getUserDiaries, updateDiaryEntry, deleteDiaryEntry } from "../services/firestoredb.js";

function Writepage(){
    const [diaryText, setDiaryText] = useState(''); //일기내용 저장할 상태
    const [analysisResultText, setAnalysisResultText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [moodScoreDisplay, setMoodScoreDisplay] = useState(null);

    const [diaries, setDiaries] = useState([]);
    const [sortBy, setSortBy] = useState('createdAtDesc'); // 정렬 기준 상태 
    const [selectDiary, setSelectDiary] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); //검색어 상태
    const [editing, setEditing] = useState(false); //글 수정 상태
    const [originalDiary, setOriginalDiary] = useState(''); //원본글과 변경된글을 저장하기 위한 상태변수
    const [diaryToDelete, setDiaryToDelete] = useState(null); // 삭제할 일기 ID 저장
    const [lastVisibleDiary, setLastVisibleDiary] = useState(null);
    const [checkMorediaries, setCheckMoreDiaries] = useState(false);

    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null); // 목록 로딩 에러
    const [moreLoading, setMoreLoading] = useState(false);
    

    const {currentUser} = useAuth();

    const [modalOpen, setModalOpen] = useState(false); //모달 열림/닫힘 상태 
    const [tempAnalysis, setTempAnalysis] = useState({ text: '', score: null }); //모달에 표시할 임시 데이터 상태
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); //삭제 모달 상태변수
    const [infoModal, setInfoModal] = useState({ isOpen: false, message: '', type: 'info' }); //setstatus 대체할 모달달

    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    useEffect(() => {
        if(currentUser){
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
              .catch(error => {
                console.error("List loading Error occured :", error);
                    setListError("List is not able to load from DB.");
                    checkMorediaries(false); // 에러 시 더보기 없음
              }).finally(() => { setListLoading(false); });
        } else {
            setDiaries([]);
            setListLoading(false);
            setLastVisibleDiary(null);
            checkMorediaries(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    

    const handleTextChange = (event) => { // textarea 내용이 변경될 때 호출될 함수
        setDiaryText(event.target.value); // 입력된 값으로 diaryText 상태 업데이트
    };
    
    const handleAnalyze = async () => {

        setLoading(true);
        setAnalysisResultText('');
        setError(null);
        setMoodScoreDisplay(null);
        setDiaryText('');
        setSelectDiary(null);
        setEditing(false);

        try{
            const { analysisText, moodScore} = await analyzeAI(diaryText);

            setAnalysisResultText(analysisText);
            setMoodScoreDisplay(moodScore); // Mood Score 상태 업데이트!
            setInfoModal({ isOpen: true, message: "Diary is stored successfully in DB.", type: 'success' });

            const diaryData = {
                userId: currentUser.uid, // 사용자 UID 저장
                userText: diaryText, // 사용자가 입력한 일기 내용 (필드 이름 확인!)
                analysisResult: analysisText, // AI 분석 결과
                createdAt: serverTimestamp(), // 서버 시간 기준으로 생성 시간 저장
                moodScore: moodScore 
            }
            const collectionRef = collection(db, "users", currentUser.uid, "diaries");
            const docRef = await addDoc(collectionRef, diaryData);
            console.log("Firestore worked! Documenmt ID:", docRef.id);
            
        } catch(Error){
            setError("Analazing error");
            console.error(Error);
        } finally{
            setLoading(false);
        }
    };
    // 다이어리 선택 핸들러
    const handleDiaryClick = (diaryid) => {
        const selectedDiary = diaries.find(diary => diary.id === diaryid);

        if(selectedDiary){
            setDiaryText(selectedDiary.userText || ''); // userText가 없을 경우 대비
            setOriginalDiary(selectedDiary.userText || '');
            setAnalysisResultText(selectedDiary.analysisResult || ''); // analysisResult가 없을 경우 대비
            // moodScore가 0일 수도 있으므로 undefined 체크
            setMoodScoreDisplay(selectedDiary.moodScore !== undefined ? selectedDiary.moodScore : null); 
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
        setDiaryText('');
        setAnalysisResultText('');
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
        setInfoModal({ isOpen: true, message: "Successfully diary updated on DB.", type: 'success' });
        setDiaries(prevDiaries =>
            prevDiaries.map(diary =>
            diary.id === selectDiary ? { ...diary, ...updatedData, updatedAt: new Date() } : diary
            )
        );
        setEditing(false);
        setSelectDiary(null);
        setDiaryText('');
        setAnalysisResultText('');
        setMoodScoreDisplay(null);
        setTempAnalysis({ text: '', score: null }); // 임시 데이터 초기화
        } catch (error) {
            console.error("Updating error:", error);
            setError(error.message || "Updating error");
        } finally {
            setLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        if(!diaryToDelete || !currentUser) return;
        setDeleteModalOpen(false); // 모달 닫기
        setLoading(true); // 로딩 시작 (버튼 비활성화 등)
        setError(null);

        try {
            await deleteDiaryEntry(currentUser.uid, diaryToDelete);
            setInfoModal({ isOpen: true, message: "Diary has been deleted successfully.", type: 'success' });
            //로컬 diaries 상태에서도 해당 항목 제거
            setDiaries(prevDiaries => prevDiaries.filter(diary => diary.id !== diaryToDelete));
            if (selectDiary === diaryToDelete) { // 만약 삭제한 일기가 현재 선택/수정 중인 일기였다면 상태 초기화
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
        if(!currentUser || !lastVisibleDiary || moreLoading){return;}
        setMoreLoading(true);
        setListError(null);
        try {
            const { diaries: newDiaries, lastVisible } = await getUserDiaries(currentUser.uid, 10, lastVisibleDiary);
            setDiaries(prevDiaries => [...prevDiaries, ...newDiaries]);
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
        let result = diaries.filter(diary =>
            diary.userText?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        
          result.sort((a,b) => {
            switch (sortBy) {
                case 'createdAtAsc':
                  // Timestamp 비교 시 toMillis() 사용 권장
                  return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
                case 'moodScoreDesc':
                  // moodScore가 null일 경우 맨 뒤로 보내기 (예시)
                  return (b.moodScore ?? -1) - (a.moodScore ?? -1);
                case 'moodScoreAsc':
                  // moodScore가 null일 경우 맨 뒤로 보내기 (예시)
                  return (a.moodScore ?? 101) - (b.moodScore ?? 101);
                case 'createdAtDesc':
                default:
                  return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
              }
          });
          return result;
    }, [diaries, searchTerm, sortBy]);

    /* ---------------------------------------------- 모달함수---------------------------------- */
    // 모달 여는 함수, 에러모달까지 같이 처리함함
    const handleOpenModal = async () => {
        // 1. 일기가 선택되었는지 확인 (수정 모드 확인)
        if (!selectDiary) {
            setErrorModal({ isOpen: true, message: "Please select a diary to update." });
            return;
        }
        // 2. 로그인 상태 확인
        if (!currentUser) {
            setErrorModal({ isOpen: true, message: "Login required." });
            return;
        }
        // 3. 내용이 비어있는지 확인
        if (!diaryText.trim()) {
            setErrorModal({ isOpen: true, message: "Diary content cannot be empty." });
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
        setInfoModal({ isOpen: false, message: '', type: 'info' });

        try {
            // 임시 상태에 새로운 분석 결과 저장
            const { analysisText: newAnalysisText, moodScore: newMoodScore} = await analyzeAI(diaryText);
            console.log("AI 재분석 점수 (newMoodScore):", newMoodScore);

            setTempAnalysis({ text: newAnalysisText, score: newMoodScore });
            setModalOpen(true); // 분석 완료 후 모달 열기
        } catch (error) {
            console.error("Analayzed error on modal:", error);
            setError(error.message || "Re-analayzing error");
        } finally {
            setLoading(false);
        }
    }
    //삭제 모달 열기 함수
    const handleOpenDeleteModal = (diaryid, event) => {
        event.stopPropagation();
        setDiaryToDelete(diaryid);
        setDeleteModalOpen(true)
    }
    // 모달 닫는 함수
    const handleCloseModal = () => {
        setModalOpen(false);
        setTempAnalysis({ text: '', score: null }); // 임시 데이터 초기화
    }
    // 에러 모달 닫기 함수
    const closeErrorModal = () => {
        setErrorModal({ isOpen: false, message: '' });
    };
    // 삭제모달 닫기 핸들러
    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDiaryToDelete(null);
    };
    // setstatus 변수 대체하는 모달 닫기 함수
    const closeInfoModal = () => {
        setInfoModal({ isOpen: false, message: '', type: 'info' });
    };
      
    /* ---------------------------------------------- HTML ---------------------------------- */
    return(
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8 gap-6 bg-gray-50 dark:bg-gray-800">
        {/* 왼쪽: 일기 작성 영역 */}
        <div className="flex-grow md:w-2/3 lg:w-3/4 bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Write diary</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">What did you think today?</p>
        <textarea
            value={diaryText}
            onChange={handleTextChange}
            placeholder="Write down your thoughts"
            rows="10"
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white dark:border-gray-500"
        />

        <div className="mt-4 flex gap-2">
        {/* 수정할때 */}
            {editing ? (
                <>
                    <button
                    onClick={handleOpenModal}
                    disabled={loading}
                    className={`px-5 py-2 rounded-md text-white font-semibold ... ${ // 스타일 동일하게 적용
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 focus:ring-green-500' // 색상 변경
                      }`}
                    >
                        {loading ? 'Checking...' : 'Update Diary'}
                    </button>
                    <button
                    onClick={handleCancelEdit}
                    disabled={loading} // 로딩 중에는 취소도 비활성화
                    className="px-5 py-2 rounded-md bg-gray-300 
                    hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Cancle
                    </button>
                </>
            ):( //일반모드드
                <button
                onClick={handleAnalyze} 
                disabled={loading} 
                className={`px-5 py-2 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    loading 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
                }`}
                >
                {loading ? 'Analyzing...' : 'Analyze my thoughts'} 
                </button>
            )}
        </div>

        {/* 상태 메시지 */}
        {error && <p className="mt-3 text-red-600">{error}</p>} 

        {/* 분석 결과 표시 */}
        {/* analysisResultText 또는 moodScoreDisplay 둘 중 하나라도 값이 있을 때 표시 */}
        {(analysisResultText || moodScoreDisplay !== null) && !loading && ( 
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500">
            <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-white">Result analyzing</h2>
            {moodScoreDisplay !== null && ( // 
                <p className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">
                Mood Score: {moodScoreDisplay} / 100 
                </p>
            )}
            {/* 분석 텍스트 */}
            {analysisResultText && ( 
                <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                {analysisResultText} 
                </div>
            )}
            </div>
        )}
        </div>

        {/* 오른쪽: 사이드 패널 */}
        <div className="hidden md:block md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-700 p-4 rounded-lg shadow overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Diaries</h2>

        {/* 정렬 및 검색 UI */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <select
            value={sortBy} // 변수명 sortBy 사용
            onChange={handleSortChange} // 함수명 handleSortChange 사용
            className="p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <option value="createdAtDesc">최신순</option>
            <option value="createdAtAsc">오래된순</option>
            <option value="moodScoreDesc">Mood Score 높은 순</option>
            <option value="moodScoreAsc">Mood Score 낮은 순</option>
            </select>
            <input
            type="text"
            placeholder="Search diaries..."
            value={searchTerm} // 검색어 상태 연결
            onChange={handleSearchChange} // 변경 핸들러 연결
            className="p-2 border 
            border-gray-300 rounded-md flex-grow dark:bg-gray-600 dark:text-white 
            dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>

        {/* 로딩 및 에러 표시 */}
        {listLoading && <p className="text-gray-500 dark:text-gray-400">Loading list...</p>} 
        {listError && <p className="text-red-600">{listError}</p>} 

        {/* 일기 목록 */}
        {!listLoading && !listError && (
          // 필터링 및 정렬된 결과(sortedAndFilteredDiaries)의 길이를 기준으로 판단
          sortedFilterDiaries.length === 0 ? (
            // 결과가 없으면
            searchTerm ? ( // 검색어가 있는지 확인
              <p className="text-gray-500 dark:text-gray-400">No diaries found matching your search.</p>
            ) : ( // 검색어가 없으면 (원래 목록이 비어있는 경우)
              <p className="text-gray-500 dark:text-gray-400">No diaries found.</p>
            )
          ) : (
            // 결과가 있으면 목록 표시 (스크롤 가능한 영역)
            <div className="flex-grow overflow-y-auto pr-2"> {/* 목록 영역만 스크롤 */}
              <ul className="space-y-4">
                {/* sortedAndFilteredDiaries 배열을 map으로 순회 */}
                {sortedFilterDiaries.map((diary) => (
                  <li
                    key={diary.id}
                    onClick={() => handleDiaryClick(diary.id)} // 상세 보기 클릭
                    className={ // group 클래스 추가 확인
                      `relative group pb-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 cursor-pointer
                      hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md p-2
                      ${
                        selectDiary === diary.id ? 'bg-blue-100 dark:bg-blue-900' : '' // 변수명 확인!
                      }`
                    }
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {/* 날짜 형식 확인! */}
                      {diary.createdAt?.toDate().toLocaleDateString('ko-KR')}
                    </p>
                    {diary.moodScore !== null && (
                      <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">
                        Mood: {diary.moodScore}
                      </p>
                    )}
                    <p className="text-base text-gray-800 dark:text-gray-100"> {/* 커서 스타일 등은 li에서 처리 */}
                      {diary.userText?.substring(0, 50)}{diary.userText?.length > 50 ? '...' : ''}
                    </p>
                    {/* 삭제 버튼 */}
                    <button
                      onClick={(e) => handleOpenDeleteModal(diary.id, e)}
                      className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                      aria-label="Delete diary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> {/* strokeWidth 조정 */}
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        {/* '더보기' 버튼 */}
        {!listLoading && checkMorediaries && ( // 초기 로딩 중 아니고, 더보기 가능할 때만 표시
          <div className="mt-4 text-center">
            <button
              onClick={loadMoreDiaries}
              disabled={moreLoading} // 더보기 로딩 중 비활성화
              className={`px-4 py-2 rounded text-sm ${
                moreLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {moreLoading ? 'Loading more...' : 'Load More'}
            </button>
          </div>
        )}

        {/* Tailwind 커스텀 모달  */}
        {modalOpen && ( // isModalOpen 상태가 true일 때만 렌더링
            // 모달 배경 (화면 전체를 덮고 반투명)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* 모달 컨텐츠 영역 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Confirm Update</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                The following analysis and mood score will be saved based on your updated text. Do you want to proceed?
                </p>

                {/* 변경될 내용 미리보기 */}
                <div className="mb-4 p-3 border border-gray-200 rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <p className="font-semibold text-gray-700 dark:text-gray-200">New Mood Score:</p>
                <p className="mb-2 dark:text-gray-100">{tempAnalysis.score !== null ? `${tempAnalysis.score} / 100` : 'N/A'}</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200">New Analysis:</p>
                <p className="text-sm whitespace-pre-wrap dark:text-gray-100">{tempAnalysis.text || 'Analysis not available.'}</p>
                </div>

                {/* 모달 버튼 영역 */}
                <div className="flex justify-end gap-3">
                <button
                    onClick={handleCloseModal} // 모달 닫기 함수 연결
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpdateDiary} // 실제 업데이트 함수 연결
                    className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold"
                >
                    Confirm Update
                </button>
                </div>
            </div>
        </div>
        )}
        {/* 에러 모달 */}
        {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Warning</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-200">{errorModal.message}</p>
            <div className="flex justify-end">
                <button
                onClick={closeErrorModal}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                >
                Close
                </button>
            </div>
            </div>
        </div>
        )}
        {/* 삭제 확인 모달 */}
        {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirm Deletion</h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete this diary entry? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCloseDeleteModal}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete} // 최종 삭제 함수 연결
                        className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
                    >
                        Delete
                    </button>
                    </div>
                </div>
                </div>
            )}
            {/* --- 정보/성공 모달 JSX 추가 --- */}
            {infoModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                    {/* type에 따라 제목 변경 가능 */}
                    <h3 className={`text-lg font-semibold mb-4 ${infoModal.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                    {infoModal.type === 'success' ? 'Success' : 'Information'}
                    </h3>
                    <p className="mb-4 text-gray-700 dark:text-gray-200">{infoModal.message}</p>
                    <div className="flex justify-end">
                    <button
                        onClick={closeInfoModal}
                        // type에 따라 버튼 색상 변경 가능
                        className={`px-4 py-2 rounded text-white ${infoModal.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        OK
                    </button>
                    </div>
                </div>
                </div>
            )}
            {/* --------------------------- */}
        </div>
    </div>
    );
}

export default Writepage;