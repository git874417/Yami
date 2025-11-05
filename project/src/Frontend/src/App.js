import React, {useState} from "react";
import Home from "./pages/Home.js";
import OrderDish from "./pages/OrderDish.js";
import Header from "./components/Header.js";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order/:orderId" element={<OrderDish />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
