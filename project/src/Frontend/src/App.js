import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.js";
import OrderDish from "./pages/OrderDish.js";
import RestaurantDishes from "./pages/Restaurant_Dishes.js";
import ShopPage from "./pages/ShopPage.js";
import Header from "./components/Header.js";
import Login from "./pages/Login.js";
import Register_Client from "./pages/Register_Client.js";
import Footer from "./components/Footer.js";
import "./App.css";

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
          <Route path="/restaurants" element={<ShopPage />} />
          <Route path="/restaurants/:restaurantId/order/:dishName" element={<OrderDish />} />
          <Route path="/restaurants/:restaurantId" element={<RestaurantDishes />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
