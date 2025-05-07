import axios from "axios";

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const api_endpoint = "https://openrouter.ai/api/v1/chat/completions";
export async function analyzeAI(UserText) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`, // API 키를 Bearer 토큰 방식으로 전달
  };

  const prompt = `
    Mood Score 를 꼭 표기하세요. 그렇지 않으면 오류를 출력합니다. 그리고 다음 내용을 숙지하세요:

    당신은 매우 유능하고 지시사항을 잘 따르는 AI 심리 분석 전문가입니다. 
    당신의 주요 임무는 사용자가 제공하는 일기 텍스트를 분석하고, 그 결과를 정확히 아래에 명시된 두 가지 작업에 따라 지정된 형식으로 응답하는 것입니다. 
    반드시 친절하고 공감하는 어조를 유지해주세요. 수행해야 할 작업은 다음과 같습니다: 인지 왜곡 분석 및 피드백(텍스트 내용에서 인지 왜곡(Cognitive Distortion) 패턴(예: 흑백논리, 과잉 일반화, 재앙화 사고, 독심술 등)이 나타나는지 주의 깊게 식별합니다.)
    만약 하나 이상의 인지 왜곡이 식별되면, 어떤 왜곡인지 명확히 언급하고, 해당 왜곡이 왜 문제적인 사고 패턴인지 간략히 설명합니다. 그리고 그 왜곡된 생각에 대한 구체적이고 실용적인 대안적 사고방식을 1~2가지 제안합니다.
    만약 텍스트에서 뚜렷한 인지 왜곡 패턴이 발견되지 않는다면, 사용자가 자신의 감정이나 경험을 솔직하게 표현한 점 등 긍정적인 측면을 찾아 구체적으로 칭찬하고 격려하는 메시지를 작성합니다.
    그리고 분석한 텍스트 내용 전체를 바탕으로 사용자의 전반적인 감정 상태를 0점에서 100점 사이의 숫자 점수로 평가합니다. 그리고 점수 기준은은 0점은 매우 부정적인 상태, 50점은 중립적인 상태, 100점은 매우 긍정적인 상태를 의미합니다.
    제일 중요한것은 평가된 점수를 숫자만 제시해야 합니다.
    `;

  const data = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `"${UserText}"`,
      },
    ],
    stream: false, // 스트리밍 응답을 원하지 않음
    max_tokens: 2000,
    temperature: 0.5, // 낮은 온도로 더 일관된 응답 유도
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
        if (analysisText.startsWith("분석결과:")) {
          analysisText = analysisText.substring("분석결과:".length).trim();
        }

        moodScore = parseInt(scoreMatch[1], 10);
        if (isNaN(moodScore) || moodScore < 0 || moodScore > 100) {
          console.warn(
            "파싱된 Mood Score가 유효 범위를 벗어났습니다:",
            moodScore
          );
          moodScore = null; // 유효하지 않으면 null
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
