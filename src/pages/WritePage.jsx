import React, {useState} from "react";
import { analyzeAI } from "../services/ai";
import { useAuth } from "../contexts/Auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore" 
import { db } from "../services/firebase";

function Writepage(){
    const [diaryText, setDiaryText] = useState(''); //일기내용 저장할 상태
    const [analysisResultText, setAnalysisResultText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saveStatus, setSaveStatus] = useState("");
    const {currentUser} = useAuth();
    const [moodScoreDisplay, setMoodScoreDisplay] = useState(null);

    const handleTextChange = (event) => { // textarea 내용이 변경될 때 호출될 함수
        setDiaryText(event.target.value); // 입력된 값으로 diaryText 상태 업데이트
    };
    
    const handleAnalyze = async () => {
        if(!currentUser){
            setError("Login needed!!")
            return;
        }
        if (!diaryText.trim()){
            setError("Write diary first! Don't be afraid of expression!");
            return;
        }

        setLoading(true);
        setAnalysisResultText('');
        setError(null);
        setSaveStatus('');
        setMoodScoreDisplay(null);

        try{
            const { analysisText, moodScore} = await analyzeAI(diaryText);

            setAnalysisResultText(analysisText);
            setMoodScoreDisplay(moodScore); // Mood Score 상태 업데이트!
            setSaveStatus("Diary is stored successfully in DB.");

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
            setSaveStatus(''); // 오류 시 저장 상태 메시지 제거
        } finally{
            setLoading(false);
        }
    };

    return(
        <div>
            <h1>Write diary</h1>
            <p>What did you think today?</p>

            <textarea name="" id=""
            value={diaryText}
            onChange={handleTextChange}
            placeholder="Write down your thoughts"
            rows="10"
            disabled={loading}  // 로딩 중에는 입력 비활성화
            style={{ width: '80%', minHeight: '200px', padding: '10px', marginTop: '10px' }}>
            </textarea>
            
            <div>
                <button onClick={handleAnalyze}
                disabled={loading}  // 로딩 중에는 입력 비활성화
                style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer' }}>
                    {loading ? 'Analyzing...' : 'Analyze my thoughts'}
                </button>
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>} 
            {saveStatus && <p style={{ color: 'green', marginTop: '10px' }}>{saveStatus}</p>}
            
            {analysisResultText && (
                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#444e3b' }}>
                    <h2>Result analyzing</h2>
                    {/* 3. Mood Score 표시 추가 */}
                    {moodScoreDisplay !== null && ( // moodScoreDisplay 값이 null이 아닐 때만 표시
                        <p style={{ fontWeight: 'bold', fontSize: '1.1em', color: "#ffffff" }}>
                        Mood Score: {moodScoreDisplay}
                        </p>
                    )}
                    {analysisResultText.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Writepage;