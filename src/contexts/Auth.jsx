import React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext();

// 다른 컴포넌트에서 Context를 쉽게 사용하기 위한 커스텀 훅
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null); // 현재 로그인된 사용자 정보 저장
    const [loading, setLoading] = useState(true); // 로딩 상태 관리 (초기 인증 상태 확인 중)
  
    // Firebase의 로그인 상태 변경 감지 리스너 설정
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user); // 사용자 상태 업데이트
        setLoading(false); // 로딩 완료
      });
  
      // 컴포넌트 언마운트 시 리스너 정리
      return unsubscribe;
    }, []); // 컴포넌트 마운트 시 한 번만 실행
  
    // 로그아웃 함수
    const logout = () => {
      return firebaseSignOut(auth); // Firebase 로그아웃 함수 호출
    }
  
    // Context Provider를 통해 전달할 값들
    const value = {
      currentUser, // 현재 사용자 정보
      logout // 로그아웃 함수
    };
  
    // 로딩 중이 아닐 때만 children 렌더링 (선택 사항: 로딩 화면을 보여줄 수도 있음)
    return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  }