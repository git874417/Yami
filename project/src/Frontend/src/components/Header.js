import React from "react";
import "../css/Header.css";
import Navbar from "./Navbar.js";
import logo from "../assets/logo.png";

const Header = () => {
  return (
    <header className="Header">
      <div className="header-content">  
        <div className="logo">
          <img src={logo} alt="Yami logo" className="logo-img" />
          <h1>Yami</h1>
        <Navbar />
        </div>
        <div className="header-spacer">
          <div className="hero-divider" />
        </div>
      </div>
    </header>
  );
};

export default Header;
