import React, {useState} from "react";
import Home from "./pages/Home.js";
import Header from "./components/Header.js";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <div>
        <Home />
      </div>
    </Router>
  );
}

export default App;
