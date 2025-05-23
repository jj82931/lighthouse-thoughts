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
    const fullResponseText = response.data?.choices?.[0]?.message?.content;

    if (fullResponseText) {
      // --- 파싱 로직 수정 ---
      let analysisText = fullResponseText.trim();
      let moodScore = null;
      let keywords = []; // ✨ 추출된 키워드를 저장할 배열

      // 정규식으로 "Mood Score"와 숫자 찾기 (더 유연하게)
      const scoreRegex = /Mood Score\s*[:-]*\s*(\d+)/i;
      const scoreMatch = fullResponseText.match(scoreRegex);
      let textBeforeMoodScore = analysisText; // Mood Score 앞부분 텍스트를 임시 저장

      if (scoreMatch && scoreMatch[1]) {
        const scoreIndex = fullResponseText.lastIndexOf(scoreMatch[0]); // ✨ 마지막 Mood Score를 찾도록 lastIndexOf 사용
        textBeforeMoodScore = fullResponseText.substring(0, scoreIndex).trim(); // Mood Score 앞부분만 잘라냄
        moodScore = parseInt(scoreMatch[1], 10);
        if (isNaN(moodScore) || moodScore < 0 || moodScore > 100) {
          moodScore = null;
        }
      } else {
        console.warn("AI 응답에서 Mood Score 패턴을 찾을 수 없습니다.");
        // Mood Score가 없으면 textBeforeMoodScore는 전체 텍스트가 됨
      }

      // Keywords 파싱 (Mood Score 파싱 후 남은 텍스트에서 Keywords 찾기)
      const keywordsRegex = /Keywords\s*[:-]*\s*(.+)/i;
      const keywordsMatch = textBeforeMoodScore.match(keywordsRegex);
      let textBeforeKeywords = textBeforeMoodScore; // Keywords 앞부분 텍스트 (실제 분석 내용)

      if (keywordsMatch && keywordsMatch[1]) {
        const keywordsIndex = textBeforeMoodScore.lastIndexOf(keywordsMatch[0]); // ✨ 마지막 Keywords를 찾도록
        textBeforeKeywords = textBeforeMoodScore
          .substring(0, keywordsIndex)
          .trim(); // Keywords 앞부분만 잘라냄
        keywords = keywordsMatch[1]
          .split(",")
          .map((kw) => kw.trim())
          .filter((kw) => kw); // 쉼표로 구분하고, 앞뒤 공백 제거, 빈 값 필터링
      } else {
        console.warn("AI 응답에서 Keywords 패턴을 찾을 수 없습니다.");
        // Keywords가 없으면 textBeforeKeywords는 textBeforeMoodScore 전체가 됨
      }

      analysisText = textBeforeKeywords; // 최종 분석 텍스트

      console.log("Parsed Analysis:", { analysisText, moodScore, keywords });
      return { analysisText, moodScore, keywords }; // ✨ keywords 반환
    }
  } catch (err) {
    console.error("AI API error:", err);
    if (err.response) {
      console.error("API 오류 응답:", err.response.status, err.response.data);
    }
    throw err;
  }
}
