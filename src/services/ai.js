import axios from "axios";
import {
  personas as allPersonas,
  defaultSystemPrompt,
} from "../data/personasData";

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const api_endpoint = "https://openrouter.ai/api/v1/chat/completions";

export async function analyzeAI(UserText, personaId = null) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`, // API 키를 Bearer 토큰 방식으로 전달
  };

  let systemMessageContent = defaultSystemPrompt; // 기본 프롬프트

  if (personaId) {
    const selectedPersonaData = allPersonas.find((p) => p.id === personaId);
    if (selectedPersonaData && selectedPersonaData.systemPrompt) {
      systemMessageContent = selectedPersonaData.systemPrompt;
    } else {
      console.warn(
        `Persona with id "${personaId}" not found or has no systemPrompt. Using default prompt.`
      );
    }
  }

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

      // 정규식으로 "Mood Score"와 숫자 찾기 (더 유연하게)
      const scoreRegex = /Mood Score\s*[:-]*\s*(\d+)/i;
      const scoreMatch = fullResponseText.match(scoreRegex);

      if (scoreMatch && scoreMatch[1]) {
        // 정규식 매칭 성공 및 숫자 그룹 존재 시
        const scoreIndex = fullResponseText.indexOf(scoreMatch[0]);
        analysisText = fullResponseText.substring(0, scoreIndex).trim();
        moodScore = parseInt(scoreMatch[1], 10);
        if (isNaN(moodScore) || moodScore < 0 || moodScore > 100) {
          moodScore = null;
        }
      } else {
        // 정규식 실패 시, 마지막 줄에서 숫자만 있는지 확인 (차선책)
        const lines = fullResponseText.split("\n");
        const lastLine = lines[lines.length - 1];
        const lastLineScoreMatch = lastLine.match(/^\s*(\d+)\s*$/);
        if (lastLineScoreMatch && lastLineScoreMatch[1]) {
          moodScore = parseInt(lastLineScoreMatch[1], 10);
          if (isNaN(moodScore) || moodScore < 0 || moodScore > 100) {
            moodScore = null;
          } else {
            // 마지막 줄이 점수였으면, 그 이전까지를 분석 텍스트로 간주
            analysisText = lines.slice(0, -1).join("\n").trim();
            if (analysisText.startsWith("분석결과:")) {
              analysisText = analysisText.substring("분석결과:".length).trim();
            }
          }
        } else {
          console.warn("AI 응답에서 Mood Score를 파싱할 수 없습니다.");
          // analysisText는 전체 응답 유지, moodScore는 null
        }
      }
      // --------------------

      return { analysisText, moodScore };
    } else {
      // 예상치 못한 응답 구조 시 에러 throw (테스트 케이스와 일치시키기 위해)
      console.error("Unexpected response data structure:", response.data);
      throw new Error("Unable to extract analysis text from the API response.");
    }
  } catch (err) {
    console.error("DeepSeek/OpenRouter API error:", err);
    if (err.response) {
      console.error("API 오류 응답:", err.response.status, err.response.data);
    }
    // 원래 발생한 에러를 다시 throw (호출 측에서 상세 에러 확인 가능)
    throw err;
  }
}
