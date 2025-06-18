import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { personas as allPersonas } from "./personasData.js";
import axios from "axios";

const db = admin.firestore();

export const getEmotionReport = onCall(
  {
    region: "australia-southeast2",
    timeoutSeconds: 180,
    memory: "512MiB",
    secrets: ["DEEPSEEK_KEY"],
  },
  async (request) => {
    // 1. 인증 확인
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const userId = request.auth.uid;

    // 2. 입력값 확인 (onCall은 request.data 로 접근)
    const { period } = request.data;
    if (period !== "weekly" && period !== "monthly") {
      throw new HttpsError(
        "invalid-argument",
        "The 'period' must be 'weekly' or 'monthly'."
      );
    }

    logger.info(
      `Report generation started for user: ${userId}, period: ${period}`
    );

    try {
      // 3. 기간 계산
      const endDate = new Date();
      const startDate = new Date();
      if (period === "weekly") {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setMonth(endDate.getMonth() - 1);
      }

      // 4. Firestore 쿼리
      const diariesRef = db.collection(`users/${userId}/diaries`);
      const diariesSnapshot = await diariesRef
        .where("createdAt", ">=", startDate)
        .where("createdAt", "<=", endDate)
        .get();

      if (diariesSnapshot.empty) {
        throw new HttpsError(
          "not-found",
          "No diary entries found for the selected period."
        );
      }

      const diaries = diariesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const totalEntries = diaries.length;

      // 5. 데이터 가공 (최고/최저, 키워드, 메인 페르소나)
      const scoredDiaries = diaries.filter(
        (d) => typeof d.moodScore === "number"
      );
      if (scoredDiaries.length === 0) {
        throw new HttpsError(
          "not-found",
          "No entries with a mood score were found."
        );
      }

      let brightestMoment = scoredDiaries[0];
      let ponderedMoment = scoredDiaries[0];
      scoredDiaries.forEach((d) => {
        if (d.moodScore > brightestMoment.moodScore) brightestMoment = d;
        if (d.moodScore < ponderedMoment.moodScore) ponderedMoment = d;
      });

      const keywordCounts = {};
      diaries.forEach((d) => {
        if (Array.isArray(d.keywords)) {
          d.keywords.forEach((kw) => {
            const trimmed = kw.trim();
            if (trimmed)
              keywordCounts[trimmed] = (keywordCounts[trimmed] || 0) + 1;
          });
        }
      });
      const keywordCloudData = Object.entries(keywordCounts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);

      const personaCounts = {};
      diaries.forEach((d) => {
        if (d.personaId)
          personaCounts[d.personaId] = (personaCounts[d.personaId] || 0) + 1;
      });

      let mainPersonaId = Object.keys(personaCounts).reduce(
        (a, b) => (personaCounts[a] > personaCounts[b] ? a : b),
        null
      );
      const mainPersonaInfo = allPersonas.find((p) => p.id === mainPersonaId);

      // 6. AI 요약 호출
      let journeyTheme = "Could not generate AI summary.";
      let lighthouseMessage = "Keep shining your light.";

      // AI 호출에 필요한 모든 데이터가 준비되었는지 확인
      if (mainPersonaInfo && keywordCloudData.length > 0) {
        const topKeywords = keywordCloudData
          .slice(0, 5)
          .map((kw) => kw.value)
          .join(", "); // 상위 5개 키워드

        // AI에게 전달할 시스템 프롬프트
        const systemPrompt = `
          You are acting as the user's chosen AI persona, '${mainPersonaInfo.name}'.
          Your task is to analyze the following summary of a user's diary entries over a period and provide two things in a warm, encouraging, and in-character tone:
          1.  **Journey Theme:** A 1-2 paragraph summary that captures the overall emotional theme of the user's journey.
          2.  **Lighthouse Message:** A short, forward-looking, and inspiring message for the user's next journey.
          You MUST provide the response in a structured JSON format:
          {
            "journeyTheme": "Your generated theme summary here.",
            "lighthouseMessage": "Your generated lighthouse message here."
          }
          Do not include any other text or markdown formatting outside of this JSON structure.`;

        // AI에게 전달할 사용자 메시지 (데이터 요약)
        const userMessage = `Here is the summary of my journey:
          - Period: ${period}
          - Total Entries: ${totalEntries}
          - My Brightest Moment (Mood: ${brightestMoment.moodScore}): "${brightestMoment.userText.substring(0, 150)}..."
          - A Moment I Pondered (Mood: ${ponderedMoment.moodScore}): "${ponderedMoment.userText.substring(0, 150)}..."
          - My Core Keywords: ${topKeywords}`;

        try {
          logger.info("Requesting AI summary...");
          const DEEPSEEK_API_KEY = process.env.DEEPSEEK_KEY.trim();
          const apiEndpoint = "https://openrouter.ai/api/v1/chat/completions";

          const requestData = {
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            response_format: { type: "json_object" }, // ✨ JSON 모드 활성화
          };

          const apiResponse = await axios.post(apiEndpoint, requestData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            },
          });

          const aiResult = apiResponse.data?.choices?.[0]?.message?.content;
          if (aiResult) {
            const parsedResult = JSON.parse(aiResult);
            journeyTheme = parsedResult.journeyTheme;
            lighthouseMessage = parsedResult.lighthouseMessage;
            logger.info("Successfully received AI summary.");
          }
        } catch (aiError) {
          logger.error("Error getting AI summary:", aiError);
          // AI 요약에 실패해도 리포트의 다른 부분은 보여주도록 기본 메시지 설정
          journeyTheme =
            "An error occurred while generating the theme summary.";
          lighthouseMessage =
            "Even if the summary isn't here, know that every step of your journey matters.";
        }
      }

      return {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalEntries,
        mainPersona: mainPersonaInfo
          ? { id: mainPersonaInfo.id, name: mainPersonaInfo.name }
          : null,
        emotionGalaxy: diaries.map((d) => ({
          id: d.id,
          createdAt: d.createdAt?.toDate
            ? d.createdAt.toDate().toISOString()
            : null,
          moodScore: d.moodScore,
          personaId: d.personaId,
          hasRecommendation:
            d.youtubeRecommendations && d.youtubeRecommendations.length > 0,
        })),
        brightestMoment: {
          ...brightestMoment,
          createdAt: brightestMoment.createdAt?.toDate
            ? brightestMoment.createdAt.toDate().toISOString()
            : null,
        },
        ponderedMoment: {
          ...ponderedMoment,
          createdAt: ponderedMoment.createdAt?.toDate
            ? ponderedMoment.createdAt.toDate().toISOString()
            : null,
        },
        keywordCloud: keywordCloudData,
        journeyTheme,
        lighthouseMessage,
      };
    } catch (error) {
      logger.error("Error during report generation:", error);
      if (error instanceof HttpsError) {
        throw error; // 이미 HttpsError인 경우 그대로 던짐
      }
      throw new HttpsError(
        "internal",
        "An internal error occurred while generating the report.",
        error.message
      );
    }
  }
);
