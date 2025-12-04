import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Header.css";
import Navbar from "./Navbar.js";
import logo from "../assets/logo.png";

const Header = ({location}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const role = sessionStorage.getItem("role");
    const restaurantName = sessionStorage.getItem("restaurant_name");
    
    if (userId && role) {
      setUser({ id: userId, role, restaurantName });
    }
  }, []);

  const handleLogoClick = () => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role === "Restaurant" || user.role === "restaurant") {
      // Navegar a RestaurantMain del restaurante
      navigate(`/restaurantPage/${encodeURIComponent(user.restaurantName)}`);
    } else if (user.role === "Client" || user.role === "client") {
      // Navegar a ShopPage
      navigate("/restaurants");
    } else if (user.role === "admin" || user.role === "Admin") {
      // Por determinar - por ahora a home
      navigate("/");
    }
  };

  return (
    <header className="Header">
      <div className="header-content">
        <div className="header-top">
          <button className="logo-button" onClick={handleLogoClick} title="Ir a inicio">
            <div className="logo">
              <img src={logo} alt="Yami logo" className="logo-img" />
              <h1>Yami</h1>
            </div>
          </button>
          <Navbar location={location} />
        </div>
        <div className="header-spacer">
          <div className="hero-divider" />
        </div>
      </div>
    </header>
  );
};

export default Header;
