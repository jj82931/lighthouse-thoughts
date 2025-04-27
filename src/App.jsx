import React from "react";
import {Routes, Route, Link, useNavigate } from "react-router-dom";
import Homepage from "./pages/HomePage";
import Writepage from "./pages/WritePage";
import { useAuth } from "./contexts/Auth";
import ProtectedRoute from "./components/ProtectionRoute";
import './App.css';

function App(){
  const { currentUser, logout } = useAuth(); // Context에서 currentUser와 logout 함수 가져오기
  const navigate = useNavigate(); // 페이지 이동을 위해 추가

  const handleNavLogout = async () => {
    try{
      await logout();
      console.log("로그아웃 성공");
      navigate('/');
    } catch (error){
      console.error("Logout error in Nav", error);
    }
  }

  return(
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {currentUser ? (
            <>
              <li><Link to="/write">Write diary</Link></li>
              <li>
                <button onClick={handleNavLogout} 
                style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/">Login</Link></li>
          )}
        </ul>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/write" 
        element={
          <ProtectedRoute>
            <Writepage></Writepage>
          </ProtectedRoute>
        }>
        </Route>
      </Routes>
    </div>
  );
}

export default App;