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
        <div>
            <h1>Welcome to Lighthouse Thoughts</h1>
            <p>Start your writing adventure with powerful AI Thoughts</p>
            {/* 나중에 여기에 등대 이미지 추가 */}

            <hr style={{ margin: '20px 0' }} /> 
            {currentUser ? (
                <div>
                    <p>Welcome, {currentUser.displayName || 'User'}</p>
                    <button onClick={handleLogout}
                    style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}>
                        Logout
                    </button>
                </div>
            ) : (
                //if log out
                <div>
                    <button onClick={handleGoogleLogin} 
                    style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Login in my thought via google
                    </button>
                </div>
            )}

            
        </div>
    );
}

export default Homepage;