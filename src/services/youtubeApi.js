import axios from "axios";

// ✨ Cloud Function URL을 환경 변수에서 가져옵니다.
const searchYoutubeFunctionUrl = import.meta.env.VITE_SEARCH_YOUTUBE_URL;

export async function searchYoutubeVideos(query, maxResults = 3) {
  // ✨ Cloud Function URL이 설정되었는지 확인합니다.
  if (!searchYoutubeFunctionUrl) {
    console.error(
      "Search YouTube function URL is not configured in .env file."
    );
    throw new Error(
      "The video recommendation service is currently unavailable."
    );
  }

  try {
    // ✨ 이제 Google YouTube API가 아닌, 우리가 만든 Cloud Function을 POST 방식으로 호출합니다.
    const response = await axios.post(searchYoutubeFunctionUrl, {
      // Cloud Function의 request.body로 전달될 데이터
      query: query,
      maxResults: maxResults,
    });

    // Cloud Function은 YouTube API의 원본 응답(response.data.items)을 그대로 전달해줍니다.
    if (response.data && response.data.items) {
      // ✨ 필요한 정보만 추출하는 파싱 로직은 클라이언트에 그대로 유지합니다.
      return response.data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
      }));
    } else {
      console.warn(
        "No items found in YouTube API response from Cloud Function:",
        response.data
      );
      return []; // 결과가 없으면 빈 배열 반환
    }
  } catch (error) {
    console.error("Error calling searchYoutube Cloud Function:", error);
    // Cloud Function에서 보낸 에러 메시지를 표시하거나, 일반적인 에러 메시지를 표시합니다.
    const errorMessage =
      error.response?.data?.error?.message ||
      "Failed to search YouTube videos.";
    throw new Error(errorMessage);
  }
}
