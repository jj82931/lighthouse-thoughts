import axios from "axios";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

export async function searchYoutubeVideos(query, maxResults = 3) {
  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API Key is missing.");
    // 실제 환경에서는 사용자에게 알리거나, 기능을 비활성화할 수 있습니다.
    return []; // 빈 배열 반환 또는 에러 throw
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: "snippet", // 동영상의 기본 정보(제목, 설명, 썸네일 등)를 가져옴
        q: query, // 검색어 (AI가 제공한 키워드)
        key: YOUTUBE_API_KEY,
        type: "video", // 비디오만 검색
        maxResults: maxResults,
        // videoEmbeddable: 'true', // 임베드 가능한 영상만 (선택적)
        // relevanceLanguage: 'ko', // 한국어 관련 영상 우선 (선택적)
        // regionCode: 'KR',       // 한국 지역 결과 우선 (선택적)
      },
    });

    if (response.data && response.data.items) {
      // 필요한 정보만 추출하여 반환
      return response.data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.default.url, // 또는 medium, high
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description, // 짧은 설명
      }));
    } else {
      console.error("No items found in YouTube API response:", response.data);
      return [];
    }
  } catch (error) {
    console.error(
      "Error searching YouTube videos:",
      error.response ? error.response.data : error.message
    );
    // API 할당량 초과, 잘못된 API 키 등의 에러를 여기서 처리할 수 있습니다.
    // 사용자에게 에러를 알리는 로직을 추가할 수 있습니다. (예: Redux 에러 모달)
    return []; // 에러 발생 시 빈 배열 반환
  }
}
