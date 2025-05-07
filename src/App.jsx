import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import Writepage from "./pages/WritePage";
// import { useAuth } from "./contexts/Auth";
import ProtectedRoute from "./components/ProtectionRoute";

function App() {
  // const { currentUser } = useAuth(); // 구글 로그인을 위해 Context에서 currentUser만 가져옴

  return (
    <Routes>
      <Route path="/" element={<Homepage />}></Route>
      <Route
        path="/write"
        element={
          <ProtectedRoute>
            <Writepage></Writepage>
          </ProtectedRoute>
        }
      ></Route>
    </Routes>
  );
}

export default App;
