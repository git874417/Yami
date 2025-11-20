import React from "react";
import {BrowserRouter as Router, Route, Routes, useLocation} from "react-router-dom";
import Home from "./pages/Home.js";
import OrderDish from "./pages/OrderDish.js";
import RestaurantDishes from "./pages/Restaurant_Dishes.js";
import ShopPage from "./pages/ShopPage.js";
import ShoppingCart from "./pages/ShoppingCart.js";
import CreateDish from "./pages/CreateDish.js";
import RestaurantMain from "./pages/RestaurantMain.js";
import RestaurantOrders from "./pages/RestaurantOrders.js";
import ModDish from "./pages/ModDish.js";
import EditRestaurant from "./pages/EditRestaurant.js";
import UserProfile from "./pages/UserProfile.js";
import Header from "./components/Header.js";
import Login from "./pages/Login.js";
import Register_Client from "./pages/Register_Client.js";
import Register_Restaurant from "./pages/Register_Restaurant.js";
import Footer from "./components/Footer.js";
import { ModalProvider } from "./context/ModalContext";
import { RestaurantCacheProvider } from "./context/RestaurantCacheContext";
import { useScrollToTop } from "./hooks/useScrollToTop.js";
import "./App.css";

function AppContent() {
  const location = useLocation();
  useScrollToTop();
  const noMostrarHeaderEn = ["/inicio-sesion", "/registro"];
  const mostrarHeader = !noMostrarHeaderEn.includes(location.pathname);

  return (
    <>
      {mostrarHeader && <Header location={location} />}
      <div className="main-page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inicio-sesion" element={<Login />} />
          <Route path="/registerClient" element={<Register_Client />} />
          <Route path="/registerRestaurant" element={<Register_Restaurant />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/restaurants" element={<ShopPage />} />
          <Route path="/carrito" element={<ShoppingCart />} />
          <Route path="/restaurants/:restaurantId/order/:dishName" element={<OrderDish />} />
          <Route path="/restaurants/:restaurantId" element={<RestaurantDishes />} />
          <Route path="/restaurantPage/:restaurantId" element={<RestaurantMain />} />
          <Route path="/restaurantPage/:restaurantId/orders" element={<RestaurantOrders />} />
          <Route path="/restaurantPage/:restaurantId/edit" element={<EditRestaurant />} />
          <Route path="/restaurantPage/:restaurantId/:dishName" element={<ModDish />} />
          <Route path="/restaurantPage/:restaurantId/createDish" element={<CreateDish />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ModalProvider>
        <RestaurantCacheProvider>
          <div className="App">
            <AppContent />
          </div>
        </RestaurantCacheProvider>
      </ModalProvider>
    </Router>
  );
}

export default App;
