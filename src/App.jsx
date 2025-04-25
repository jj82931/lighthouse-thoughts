import React from "react";
import {Routes, Route, Link } from "react-router-dom";
import Homepage from "./pages/HomePage";
import Writepage from "./pages/WritePage";
import './App.css';

function App(){
  return(
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/write">Write diary</Link></li>
        </ul>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/write" element={<Writepage />}></Route>
      </Routes>
    </div>
  );
}

export default App;