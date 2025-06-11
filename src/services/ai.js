// src/services/ai.js
import axios from "axios";

// ✨ Cloud Function URL을 환경 변수에서 가져옵니다.
const analyzeDiaryFunctionUrl = import.meta.env.VITE_ANALYZE_DIARY_URL;

export async function analyzeAI(userText, personaId) {
  // ✨ Cloud Function URL이 설정되었는지 확인
  if (!analyzeDiaryFunctionUrl) {
    console.error("Analyze Diary function URL is not configured in .env file.");
    throw new Error(
      "The analysis service is currently unavailable. Please contact support."
    );
  }

  try {
    // ✨ 이제 OpenRouter API가 아닌, 우리가 만든 Cloud Function을 POST 방식으로 호출합니다.
    const response = await axios.post(analyzeDiaryFunctionUrl, {
      // Cloud Function의 request.body로 전달될 데이터
      userText: userText,
      personaId: personaId,
    });

    // Cloud Function은 AI의 원본 응답(response.data.choices...)을 그대로 전달해줍니다.
    let fullResponseText = response.data?.choices?.[0]?.message?.content;

    if (fullResponseText) {
      // ✨ 파싱 로직은 클라이언트에 그대로 유지합니다.
      fullResponseText = fullResponseText.trim();
      console.log(
        "Original AI Response (from Cloud Function):\n",
        fullResponseText
      );

      let moodScore = null;
      let diaryKeywords = [];
      let recommendedCategory = "";
      let youtubeSearchKeywords = [];
      let analysisText = fullResponseText;

      // 1. Mood Score 추출
      const moodScoreRegex = /\*\*Mood Score:\*\*\s*(\d+)\s*$/im;
      const moodScoreMatch = analysisText.match(moodScoreRegex);
      if (moodScoreMatch && moodScoreMatch[1]) {
        moodScore = parseInt(moodScoreMatch[1], 10);
        if (isNaN(moodScore) || moodScore < 0 || moodScore > 100)
          moodScore = null;
        analysisText = analysisText.replace(moodScoreRegex, "").trim();
      } else {
        console.warn("Mood Score pattern not found at the end.");
      }

      // 2. (일기) Keywords 추출
      const diaryKeywordsRegex =
        /\*\*Keywords:\*\*\s*([^\n]+?)\s*(?=(\*\*Mood Score:\*\*|$))/im;
      const diaryKeywordsMatch = analysisText.match(diaryKeywordsRegex);
      if (diaryKeywordsMatch && diaryKeywordsMatch[1]) {
        diaryKeywords = diaryKeywordsMatch[1]
          .split(",")
          .map((kw) => kw.trim())
          .filter((kw) => kw);
        analysisText = analysisText.replace(diaryKeywordsRegex, "").trim();
      } else {
        console.warn("(Diary) Keywords pattern not found.");
      }

      // 3. YouTube Search Keywords 추출
      const ytSearchKeywordsRegex =
        /\*\*YouTube Search Keywords:\*\*\s*([^\n]+?)\s*(?=(\*\*Keywords:\*\*|$))/im;
      const ytSearchKeywordsMatch = analysisText.match(ytSearchKeywordsRegex);
      if (ytSearchKeywordsMatch && ytSearchKeywordsMatch[1]) {
        youtubeSearchKeywords = ytSearchKeywordsMatch[1]
          .split(",")
          .map((kw) => kw.trim())
          .filter((kw) => kw);
        analysisText = analysisText.replace(ytSearchKeywordsRegex, "").trim();
      } else {
        console.warn("YouTube Search Keywords pattern not found.");
      }

      // 4. Recommended Content Category 추출
      const recCategoryRegex =
        /\*\*Recommended Content Category:\*\*\s*([^\n]+?)\s*(?=(\*\*YouTube Search Keywords:\*\*|$))/im;
      const recCategoryMatch = analysisText.match(recCategoryRegex);
      if (recCategoryMatch && recCategoryMatch[1]) {
        recommendedCategory = recCategoryMatch[1].trim();
        analysisText = analysisText.replace(recCategoryRegex, "").trim();
      } else {
        console.warn("Recommended Content Category pattern not found.");
      }

      // 5. 남은 텍스트 정리
      analysisText = analysisText.replace(/^\s*---\s*/, "").trim();
      analysisText = analysisText.replace(/\s*---\s*$/, "").trim();
      analysisText = analysisText.replace(/\n\s*\n/g, "\n");

      const finalResult = {
        analysisText,
        moodScore,
        keywords: diaryKeywords,
        recommendedCategory,
        youtubeSearchKeywords,
      };
      console.log(
        "Final Parsed AI Response (from Cloud Function):",
        finalResult
      );
      return finalResult;
    } else {
      console.error("AI response content from Cloud Function is missing.");
      throw new Error("AI response content from Cloud Function is missing.");
    }
  } catch (error) {
    console.error("Error calling analyzeDiary Cloud Function:", error);
    const errorMessage =
      error.response?.data?.error || "Failed to get analysis from AI.";
    throw new Error(errorMessage);
  }
}
