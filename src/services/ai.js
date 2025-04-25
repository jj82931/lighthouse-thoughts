import axios from "axios";

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const api_endpoint = 'https://api.deepseek.com/chat/completions';

export async function analyzeAI(UserText) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}` // API 키를 Bearer 토큰 방식으로 전달
    };

    const data = {
        model: "deepseek-chat",
        messages: [
            {
              role: "system",
              content: `다음 텍스트는 사용자가 작성한 일기입니다. 이 텍스트를 분석하여 인지 왜곡(cognitive distortion) 패턴이 있는지 식별하고, 있다면 어떤 왜곡인지 설명하며, 해당 왜곡에 대한 대안적인 사고방식을 제안해주세요. 
              만약 뚜렷한 인지 왜곡이 없다면, 긍정적인 부분을 찾아 칭찬하거나 격려하는 메시지를 작성해주세요. 친절하고 공감하는 어조로 답변해주세요.`
            },
            {
              role: "user",
              content: `다음 일기 내용을 분석해주세요: "${UserText}"`
            }
          ],
          // stream: false // 스트리밍 응답을 원하지 않으면 false (기본값일 수 있음)
          // max_tokens: 1024 // 최대 출력 토큰 수 (선택 사항)
          // temperature: 0.7 // 창의성 조절 (선택 사항, 0~1)
    };

    try{
        const response = await axios.post(api_endpoint, data, {headers: headers});

        if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message && response.data.choices[0].message.content){
            return response.data.choices[0].message.content.trim();
        }else{
            console.error("Unexpected response data:", response.data);
            throw new Error("Unable to analyze your text from deepseek");
        }
    } catch (err){
        console.error("DeepSeek API error:", err);

        if (err.response) {
            // 서버가 상태 코드로 응답한 경우 (2xx 범위 밖)
            console.error('Respnse data:', err.response.data);
            console.error('Respnse status:', err.response.status);
            console.error('Respnse header:', err.response.headers);
          } else if (err.request) {
            // 요청이 이루어졌으나 응답을 받지 못한 경우
            console.error('Respnse info:', err.request);
          } else {
            // 요청 설정 중에 에러가 발생한 경우
            console.error('Error', err.message);
          }
          return "Error is occured. plz try again later";
    }
}