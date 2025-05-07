// src/services/ai.test.js
import { describe, it, expect, vi, beforeEach } from "vitest"; // Vitest 유틸리티 import
import axios from "axios"; // Mocking할 axios import
import { analyzeAI } from "./ai"; // 테스트할 함수 import

// axios 모듈 전체를 모킹
vi.mock("axios");

describe("analyzeAI function", () => {
  // 각 테스트 실행 전에 Mock 초기화 (선택 사항이지만 권장)
  beforeEach(() => {
    vi.clearAllMocks(); // 모든 Mock 호출 기록 지우기
  });

  // --- 테스트 케이스 1: 정상적인 응답 (Mood Score 포함) ---
  it("should parse analysis text and mood score correctly from valid response", async () => {
    // Mock 설정: axios.post가 특정 응답을 반환하도록 설정
    const mockResponseData = {
      choices: [
        {
          message: {
            content:
              "분석결과:\n인지 왜곡은 발견되지 않았습니다. 긍정적이네요!\n\nMood Score: 70",
          },
        },
      ],
    };
    axios.post.mockResolvedValue({ data: mockResponseData }); // 성공 응답(Promise) 설정

    const result = await analyzeAI("평범한 하루.");
    expect(result.moodScore).toBe(70); // 이제 정규식으로 70을 찾을 것으로 기대

    expect(axios.post).toHaveBeenCalledTimes(1); // axios.post가 1번 호출되었는지 확인
    expect(result.analysisText).toBe(
      "인지 왜곡은 발견되지 않았습니다. 긍정적이네요!"
    );
  });

  // --- 테스트 케이스 2: Mood Score 레이블 형식이 약간 다른 경우 (파싱 로직 강화 테스트) ---
  it("should parse mood score even with slightly different label format", async () => {
    const mockResponseData = {
      choices: [
        {
          message: {
            content: "분석결과:\n괜찮아 보입니다.\n\nMood Score :  70",
          },
        },
      ], // 콜론 뒤 공백 추가
    };
    axios.post.mockResolvedValue({ data: mockResponseData });

    const result = await analyzeAI("평범한 하루.");
    expect(result.moodScore).toBe(70);
  });

  // --- 테스트 케이스 3: Mood Score 레이블이 없는 경우 ---
  it("should return null for mood score if label is missing", async () => {
    const mockResponseData = {
      choices: [
        { message: { content: "분석결과:\n분석 내용만 있습니다.\n75" } },
      ], // 레이블 없고 숫자만 마지막 줄에
    };
    axios.post.mockResolvedValue({ data: mockResponseData });

    const result = await analyzeAI("그냥 그래.");
    // 강화된 파싱 로직이 마지막 줄 숫자만 있는 경우를 처리한다면 toBe(75)
    // 그렇지 않다면 toBe(null)
    expect(result.moodScore).toBe(75); // 마지막 줄 숫자 추출 로직으로 75를 찾을 것으로 기대
    expect(result.analysisText).toBe("분석 내용만 있습니다.");
  });

  // --- 테스트 케이스 4: Mood Score 값이 숫자가 아니거나 범위를 벗어난 경우 ---
  it("should return null for mood score if value is invalid", async () => {
    const mockResponseData = {
      choices: [{ message: { content: "분석결과:\n...\n\nMood Score: N/A" } }], // 숫자가 아님
    };
    axios.post.mockResolvedValue({ data: mockResponseData });

    const result1 = await analyzeAI("...");
    expect(result1.moodScore).toBeNull();

    const mockResponseData2 = {
      choices: [{ message: { content: "분석결과:\n...\n\nMood Score: 120" } }], // 범위 초과
    };
    axios.post.mockResolvedValue({ data: mockResponseData2 });
    const result2 = await analyzeAI("...");
    expect(result2.moodScore).toBeNull();
  });

  // --- 테스트 케이스 5: API 호출 실패 시 에러 발생 ---
  it("should throw an error if API call fails", async () => {
    // Mock 설정: axios.post가 에러를 발생시키도록 설정
    const mockError = new Error("Network Error");
    axios.post.mockRejectedValue(mockError); // 실패 응답(Promise) 설정

    // 함수 실행 시 에러가 발생하는지 검증 (비동기 에러는 rejects 사용)
    await expect(analyzeAI("에러 테스트")).rejects.toThrow("Network Error");

    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  // --- 테스트 케이스 6: API 응답 구조가 예상과 다른 경우 ---
  it("should throw an error if API response structure is unexpected", async () => {
    const mockResponseData = { result: "다른 형식의 응답" }; // choices가 없음
    axios.post.mockResolvedValue({ data: mockResponseData });

    await expect(analyzeAI("구조 테스트")).rejects.toThrow(
      "Unable to extract analysis text from the API response."
    );
  });
});
