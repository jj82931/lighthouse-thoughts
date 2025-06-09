import axios from "axios";
import { personas as allPersonas } from "../data/personasData";

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const api_endpoint = "https://openrouter.ai/api/v1/chat/completions";

export async function analyzeAI(UserText, personaId) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`, // API 키를 Bearer 토큰 방식으로 전달
  };

  // --- 시스템 프롬프트 선택 로직 ---
  const selectedPersonaData = allPersonas.find((p) => p.id === personaId);

  if (!selectedPersonaData || !selectedPersonaData.systemPrompt) {
    // ✨ 유효한 페르소나 ID가 아니거나, 해당 페르소나에 systemPrompt가 정의되지 않은 경우
    console.error(
      `Error: Persona with id "${personaId}" not found or has no systemPrompt.`
    );
    // 실제 운영 환경에서는 사용자에게 더 친절한 에러를 반환하거나, 기본 동작을 정의해야 할 수 있음
    throw new Error(
      `Invalid persona selected or system prompt missing for persona: ${personaId}`
    );
  }
  const systemMessageContent = selectedPersonaData.systemPrompt;
  // ---------------------------------

  const data = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      {
        role: "system",
        content: systemMessageContent,
      },
      {
        role: "user",
        content: UserText,
      },
    ],
    stream: false, // 스트리밍 응답을 원하지 않음
    max_tokens: 2000,
    temperature: 0.7, // 페르소나의 개성을 살리기 위해 온도를 살짝 높여볼 수 있습니다 (0.5 ~ 0.8 사이)
  };

  try {
    const response = await axios.post(api_endpoint, data, { headers: headers });
    let fullResponseText = response.data?.choices?.[0]?.message?.content;

    if (fullResponseText) {
      fullResponseText = fullResponseText.trim();
      console.log(
        "Original AI Response (for parsing debug):\n",
        fullResponseText
      );

      let moodScore = null;
      let diaryKeywords = [];
      let recommendedCategory = "";
      let youtubeSearchKeywords = [];
      let analysisText = fullResponseText; // 작업 대상 텍스트

      // 1. Mood Score 추출 (가장 마지막에 위치)
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
      // console.log("After Mood Score, remaining:\n", analysisText);

      // 2. (일기) Keywords 추출 (Mood Score 바로 앞에 위치)
      const diaryKeywordsRegex =
        /\*\*Keywords:\*\*\s*([^\n]+?)\s*(?=(\*\*Mood Score:\*\*|$))/im; // Mood Score 전까지
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
      // console.log("After Diary Keywords, remaining:\n", analysisText);

      // 3. YouTube Search Keywords 추출 (일기 Keywords 바로 앞에 위치)
      const ytSearchKeywordsRegex =
        /\*\*YouTube Search Keywords:\*\*\s*([^\n]+?)\s*(?=(\*\*Keywords:\*\*|$))/im; // Keywords 전까지
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
      // console.log("After YT Search Keywords, remaining:\n", analysisText);

      // 4. Recommended Content Category 추출 (YouTube Search Keywords 바로 앞에 위치)
      const recCategoryRegex =
        /\*\*Recommended Content Category:\*\*\s*([^\n]+?)\s*(?=(\*\*YouTube Search Keywords:\*\*|$))/im; // YouTube Search Keywords 전까지
      const recCategoryMatch = analysisText.match(recCategoryRegex);
      if (recCategoryMatch && recCategoryMatch[1]) {
        recommendedCategory = recCategoryMatch[1].trim();
        analysisText = analysisText.replace(recCategoryRegex, "").trim();
      } else {
        console.warn("Recommended Content Category pattern not found.");
      }
      // console.log("After Rec Category, remaining (this should be mostly analysisText):\n", analysisText);

      // 5. 남은 텍스트에서 혹시 있을지 모르는 구분선(---)이나 불필요한 앞뒤 공백 제거
      analysisText = analysisText.replace(/^\s*---\s*/, "").trim(); // 시작 부분의 --- 제거
      analysisText = analysisText.replace(/\s*---\s*$/, "").trim(); // 끝 부분의 --- 제거 (만약 있다면)
      analysisText = analysisText.replace(/\n\s*\n/g, "\n"); // 여러 빈 줄 정리

      // (선택적) 페르소나의 특정 시작/끝맺음 문구 제거 로직 (필요하다면)
      // 예: Dr. Jun의 "*[Adjusts imaginary lab coat]*" 같은 부분
      // analysisText = analysisText.replace(/\*\[Adjusts imaginary lab coat\]\*/g, "").trim();

      const finalResult = {
        analysisText,
        moodScore,
        keywords: diaryKeywords,
        recommendedCategory,
        youtubeSearchKeywords,
      };
      console.log(
        "Final Parsed AI Response (Based on actual samples):",
        finalResult
      );
      return finalResult;
    } else {
      console.error("AI response content is empty or undefined.");
      throw new Error("AI response content is missing.");
    }
  } catch (err) {
    console.error("AI API error:", err);
    if (err.response) {
      console.error("API 오류 응답:", err.response.status, err.response.data);
    }
    throw err;
  }
}
