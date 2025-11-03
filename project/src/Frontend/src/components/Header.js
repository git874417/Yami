import React from "react";
import "../css/Header.css";
import Navbar from "./Navbar.js";

const Header = () => {
  return (
    <header
      style={{
        backgroundColor: "#ffffffff",
        color: " rgba(0, 0, 0, 1)",
        textalign: "center",
        padding: "1rem",
        display: "flex",
      }}
    >
      <h1>Yami</h1>
      <Navbar />
    </header>
  );
};

export default Header;
