import React from "react";
import "./App.css";
import GetStarted from "./Components/GetStarted.js";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Discord from "./Components/Discord.js";

import Header from "./Components/Header";


function App() {
  
  return (
    
      <Router>
        
        <Routes>
          

          <Route path="/" element={<GetStarted />} />
          <Route path="/discord" element={<Discord />} />
        </Routes>
      </Router>
   
  );
}

export default App;
