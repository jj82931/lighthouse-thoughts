import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/Auth';

function ProtectedRoute({ children }) {
    const { currentUser } = useAuth(); // 현재 로그인된 사용자 정보 가져오기
  
    if (!currentUser) {
      // 로그인되어 있지 않으면 홈 페이지('/')로 리다이렉트
      // replace 옵션은 브라우저 히스토리에 현재 경로(/write)를 남기지 않음
      return <Navigate to="/" replace />;
    }
  
    // 로그인되어 있으면 자식 컴포넌트(children)를 그대로 렌더링
    return children;
  }
  
export default ProtectedRoute;