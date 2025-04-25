import React, {useState} from "react";
import { analyzeAI } from "../services/ai";

function Writepage(){
    const [diaryText, setDiaryText] = useState(''); //일기내용 저장할 상태
    const [analyzeResult, setAnalyzeResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            
            {analyzeResult && (
                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                    <h2>Result analyzing</h2>
                    {analyzeResult.split('\n').map((line, index) => (
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