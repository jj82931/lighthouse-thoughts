// ✨ v2 API를 위한 import 구문
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import { personas as allPersonas } from "./personasData.js";
import cors from "cors";

const corsHandler = cors({ origin: true });

// --- DeepSeek AI 분석을 위한 Cloud Function (v2 방식) ---
export const analyzeDiary = onRequest(
  // ✨ v2 방식: 첫 번째 인자로 옵션 객체 전달
  {
    region: "australia-southeast2",
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: ["DEEPSEEK_KEY"],
  },
  (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      try {
        const { userText, personaId } = request.body;
        if (!userText || !personaId) {
          logger.error("Missing userText or personaId in request body");
          response
            .status(400)
            .send({ error: "userText and personaId are required." });
          return;
        }
        logger.info("analyzeDiary called with personaId:", personaId);

        const DEEPSEEK_API_KEY_RAW = process.env.DEEPSEEK_KEY; // ✨ 원본 값을 먼저 가져옴
        if (!DEEPSEEK_API_KEY_RAW) {
          logger.error("DeepSeek API key is not configured.");
          response.status(500).send({ error: "Server configuration error." });
          return;
        }
        const DEEPSEEK_API_KEY = DEEPSEEK_API_KEY_RAW.trim(); // ✨ .trim()으로 공백/줄바꿈 제거

        const selectedPersonaData = allPersonas.find(
          (p: any) => p.id === personaId
        );
        if (!selectedPersonaData || !selectedPersonaData.systemPrompt) {
          logger.error(
            `Persona with id "${personaId}" not found or has no systemPrompt.`
          );
          response
            .status(400)
            .send({ error: `Invalid persona selected: ${personaId}` });
          return;
        }
        const systemMessageContent = selectedPersonaData.systemPrompt;

        const apiEndpoint = "https://openrouter.ai/api/v1/chat/completions";
        const requestData = {
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [
            { role: "system", content: systemMessageContent },
            { role: "user", content: userText },
          ],
        };

        const apiResponse = await axios.post(apiEndpoint, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
        });

        logger.info("Successfully got response from DeepSeek API.");
        response.status(200).send(apiResponse.data);
      } catch (error: any) {
        logger.error("Error in analyzeDiary function:", error);
        if (axios.isAxiosError(error) && error.response) {
          response.status(error.response.status).send(error.response.data);
        } else {
          response
            .status(500)
            .send({ error: "An internal server error occurred." });
        }
      }
    });
  }
);

// --- YouTube 검색을 위한 Cloud Function (v2 방식) ---
export const searchYoutube = onRequest(
  // ✨ v2 방식: 첫 번째 인자로 옵션 객체 전달
  {
    region: "australia-southeast2",
    timeoutSeconds: 120,
    memory: "256MiB",
    secrets: ["YOUTUBE_KEY"],
  },
  (request, response) => {
    corsHandler(request, response, async () => {
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      try {
        const { query, maxResults = 3 } = request.body;
        if (!query) {
          logger.error("Missing query in request body");
          response.status(400).send({ error: "query is required." });
          return;
        }
        logger.info("searchYoutube called with query:", query);

        const YOUTUBE_API_KEY_RAW = process.env.YOUTUBE_KEY;
        if (!YOUTUBE_API_KEY_RAW) {
          logger.error("YouTube API key is not configured.");
          response.status(500).send({ error: "Server configuration error." });
          return;
        }
        const YOUTUBE_API_KEY = YOUTUBE_API_KEY_RAW.trim(); // ✨ .trim()으로 공백/줄바꿈 제거

        const youtubeApiUrl = "https://www.googleapis.com/youtube/v3/search";
        const apiResponse = await axios.get(youtubeApiUrl, {
          params: {
            part: "snippet",
            q: query,
            key: YOUTUBE_API_KEY,
            type: "video",
            maxResults: maxResults,
            videoEmbeddable: "true",
          },
        });

        logger.info("Successfully got response from YouTube API.");
        response.status(200).send(apiResponse.data);
      } catch (error: any) {
        logger.error("Error in searchYoutube function:", error);
        if (axios.isAxiosError(error) && error.response) {
          response.status(error.response.status).send(error.response.data);
        } else {
          response
            .status(500)
            .send({ error: "An internal server error occurred." });
        }
      }
    });
  }
);
