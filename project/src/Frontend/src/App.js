import React, {useState} from "react";
import {BrowserRouter as Router, Route, Routes, useLocation} from "react-router-dom";
import Home from "./pages/Home.js";
import OrderDish from "./pages/OrderDish.js";
import Header from "./components/Header.js";
import Login from "./pages/Login.js";
import Register_Client from "./pages/Register_Client.js";

import "./App.css";
import Footer from "./components/Footer.js";

function AppContent() {
  const location = useLocation();
  const noMostrarHeaderEn = ["/inicio-sesion", "/registro"];
  const mostrarHeader = !noMostrarHeaderEn.includes(location.pathname);

  return (
    <>
      {mostrarHeader && <Header />}
      <div className="main-page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inicio-sesion" element={<Login />} />
          <Route path="/registro" element={<Register_Client />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}
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
      <AppContent />
    </Router>
  );
}

export default App;
