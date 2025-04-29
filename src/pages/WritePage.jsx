import React, {useState} from "react";
import React, {useEffect, useState} from "react";
import { analyzeAI } from "../services/ai";
import { useAuth } from "../contexts/Auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { getUserDiaries } from "../services/firestoredb.js";

function Writepage(){
    const [diaryText, setDiaryText] = useState(''); //일기내용 저장할 상태
    const [analyzeResult, setAnalyzeResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saveStatus, setSaveStatus] = useState("");
    const [moodScoreDisplay, setMoodScoreDisplay] = useState(null);

    const [diaries, setDiaries] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null); // 목록 로딩 에러
    const [sortBy, setSortBy] = useState('createdAtDesc'); // 정렬 기준 상태 

    const {currentUser} = useAuth();

    useEffect(() => {
        if(currentUser){
            setListLoading(true); //리스트 로딩
            setListError(null);

            getUserDiaries(currentUser.uid, sortBy).then(fetchedDiaries => {
                setDiaries(fetchedDiaries);
            }).catch(error => {
                console.error("List loading Error occured :", error);
                setListError("List is not able to load from DB.");
            }).finally(() => {
                setListLoading(false); // 로딩 종료 (성공/실패 무관)
            });
        } else {
            // 로그인한 사용자가 없으면 목록 비우기
            setDiaries([]);
            setListLoading(false); // 로딩 상태 false로 설정
        }
    },[currentUser, sortBy]);

    const handleTextChange = (event) => { // textarea 내용이 변경될 때 호출될 함수
        setDiaryText(event.target.value); // 입력된 값으로 diaryText 상태 업데이트
    };
    
    const handleAnalyze = async () => {
        if (!diaryText.trim()){
            setError("분석할 내용을 입력해주세요.");
            return;
        }

        setLoading(true);
        setAnalyzeResult('');
        setError(null);

        try{
            const result = await analyzeAI(diaryText);
            setAnalyzeResult(result);
        } catch(Error){
            setError("분석 중 오류가 발생했습니다.");
            console.error(Error);
        } finally{
            setLoading(false);
        }
    };
    // --- 정렬 변경 핸들러 ---
    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };


        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Write diary</h1>
        <textarea
            value={diaryText}
            onChange={handleTextChange}
            placeholder="Write down your thoughts"
            rows="10"
            disabled={loading} // 변수명 loading 사용
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white dark:border-gray-500"
        />

        <div className="mt-4">
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
        </div>

        {/* 상태 메시지 */}
        {error && <p className="mt-3 text-red-600">{error}</p>} 
        {saveStatus && <p className="mt-3 text-green-600">{saveStatus}</p>} 

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
            className="p-2 border border-gray-300 rounded-md flex-grow dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>

        {/* 로딩 및 에러 표시 */}
        {listLoading && <p className="text-gray-500 dark:text-gray-400">Loading list...</p>} 
        {listError && <p className="text-red-600">{listError}</p>} 

        {/* 일기 목록 */}
        {!listLoading && !listError && diaries.length === 0 && ( 
            <p className="text-gray-500 dark:text-gray-400">No diaries found.</p>
        )}
        {!listLoading && !listError && diaries.length > 0 && ( 
            <ul className="space-y-4">
            {diaries.map((diary) => ( 
                <li key={diary.id} className="pb-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {diary.createdAt?.toDate().toLocaleDateString('ko-KR')}
                </p>
                {diary.moodScore !== null && (
                    <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">
                    Mood: {diary.moodScore}
                    </p>
                )}
                <p className="text-base text-gray-800 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                    {diary.userText?.substring(0, 50)}{diary.userText?.length > 50 ? '...' : ''}
                </p>
                </li>
            ))}
            </ul>
        )}
        </div>

    </div>
    );
}

export default Writepage;