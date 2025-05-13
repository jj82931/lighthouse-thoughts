import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/Auth";

function HomePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/write");
    } catch (error) {
      console.error("Google 로그인 에러:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("로그아웃 성공");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  return (
    // --- 전체 컨테이너: 따뜻한 어두운 테마 적용 ---
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 p-4">
      {/* 메인 컨텐츠 영역 */}
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-100 mb-4">
          Welcome to Lighthouse Thoughts
        </h1>
        <p className="text-lg text-stone-300 mb-8">
          Start your writing adventure with powerful AI Thoughts
        </p>

        {/* 구분선: --border-primary */}
        <hr className="border-stone-700 w-1/2 mx-auto mb-8" />

        {/* 로그인/로그아웃 섹션 */}
        <div className="space-y-4">
          {currentUser ? (
            // 로그인된 경우
            <div>
              <p className="text-stone-200 mb-2">
                Welcome,{" "}
                <span className="font-semibold">
                  {currentUser.displayName || "user"}
                </span>
                !
              </p>
              {/* 로그아웃 버튼: 색상 변경 */}
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50" // --error-bg, hover
              >
                Logout
              </button>
            </div>
          ) : (
            // 로그아웃된 경우
            <div>
              <p className="text-stone-200 mb-2">Login in my thought:</p>
              <button
                onClick={handleGoogleLogin}
                // Google 버튼 스타일 가이드라인 참고 (예: 흰색 배경)
                className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-blue-500" // Google 스타일 유사하게 적용
              >
                <svg
                  className="mr-2 -ml-1 h-5 w-5"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 381.5 512 244.8 512 112.8 512 0 398.5 0 256S112.8 0 244.8 0c71.1 0 130.8 28.7 176.4 73.4L345 148.1c-21.9-20.6-52.3-33.8-100.2-33.8-81.1 0-146.9 65.8-146.9 146.9s65.8 146.9 146.9 146.9c90.1 0 128.1-64.3 133.6-97.6H244.8v-71.4h239.1c1.2 6.9 2.2 14.3 2.2 22.1z"
                  ></path>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    // ------------------------------------------
  );
}

export default HomePage;
