import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/Auth";

function Homepage(){
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
          await signInWithPopup(auth, provider);
          navigate('/write'); // 예시: 로그인 후 바로 쓰기 페이지로 이동
    
        } catch (error) {
          console.error("Google 로그인 에러:", error);
          const errorMessage = error.message;
          alert(`로그인 중 오류가 발생했습니다: ${errorMessage}`);
        }
      };

      const handleLogout = async () => {
        try {
          await logout(); // Context에서 가져온 logout 함수 사용
          console.log("로그아웃 성공");
          // 로그아웃 후 홈으로 이동 (이미 홈이지만 명시적으로)
          navigate('/');
        } catch (error) {
          console.error("로그아웃 에러:", error);
        }
      };

    return(
      // 전체 컨테이너: 최소 높이 화면 크기, flex 중앙 정렬, 패딩
      <div className="min-h-screen flex flex-col items-center justify-center 
      bg-gray-100 dark:bg-gray-900 p-4">
      {/* 메인 컨텐츠 영역: 최대 너비 설정, 텍스트 중앙 정렬 */}
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to Lighthouse Thoughts
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Start your writing adventure with powerful AI Thoughts
        </p>

        <hr className="border-gray-300 dark:border-gray-700 w-1/2 mx-auto mb-8" />

        {/* 로그인/로그아웃 섹션 */}
        <div className="space-y-4"> {/* 버튼/텍스트 간격 */}
          {currentUser ? (
            // 로그인된 경우
            <div>
              <p className="text-gray-700 dark:text-gray-200 mb-2">
                Welcome, <span className="font-semibold">{currentUser.displayName || 'user'}</span>!
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-md 
                hover:bg-red-600 focus:outline-none focus:ring-2 
                focus:ring-red-500 focus:ring-opacity-50"
              >
                Logout
              </button>
            </div>
          ) : (
            // 로그아웃된 경우
            <div>
              <p className="text-gray-700 dark:text-gray-200 mb-2">
                Login in my thought:
              </p>
              <button
                onClick={handleGoogleLogin} 
                className="px-6 py-2 bg-blue-500 text-white rounded-md 
                hover:bg-blue-600 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:ring-opacity-50"
              >
                Google login
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
    // --- Tailwind CSS 적용 끝 ---
    );
}

export default Homepage;