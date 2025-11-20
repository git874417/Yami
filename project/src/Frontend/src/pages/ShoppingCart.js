import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ShoppingCart.css";
import axios from "axios";

const ShoppingCart = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // Cargar carrito del sessionStorage
    const carritoGuardado = sessionStorage.getItem("carrito");
    if (carritoGuardado) {
      try {
        const carrito = JSON.parse(carritoGuardado);
        setCartData(carrito);
      } catch (error) {
        console.error("Error parsing cart:", error);
        setCartData(null);
      }
    }
  }, []);

  const handleRemoveDish = (dishId) => {
    if (!cartData) return;

    const updatedDishes = cartData.dishes.filter((d) => d.dishId !== dishId);

    if (updatedDishes.length === 0) {
      sessionStorage.removeItem("carrito");
      setCartData(null);
    } else {
      const updatedCart = {
        ...cartData,
        dishes: updatedDishes,
      };
      sessionStorage.setItem("carrito", JSON.stringify(updatedCart));
      setCartData(updatedCart);
    }

    window.dispatchEvent(new Event("carritoActualizado"));
  };

  const handleUpdateInstructions = (dishId, newInstructions) => {
    if (!cartData) return;

    const updatedDishes = cartData.dishes.map((d) =>
      d.dishId === dishId ? { ...d, instructions: newInstructions } : d
    );

    const updatedCart = {
      ...cartData,
      dishes: updatedDishes,
    };

    sessionStorage.setItem("carrito", JSON.stringify(updatedCart));
    setCartData(updatedCart);
  };

  const calculateTotal = () => {
    if (!cartData || !cartData.dishes) return 0;
    return cartData.dishes.reduce((total, dish) => total + (dish.credits || 0), 0);
  };

  const handlePlaceOrder = async () => {
    const clientId = sessionStorage.getItem("role_id");
    if (!clientId) {
      alert("Por favor, inicia sesión para realizar un pedido.");
      navigate("/inicio-sesion");
      return;
    }

    if (!cartData || cartData.dishes.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    setLoading(true);

    try {
      const restaurantId = cartData.restaurantId;
      const datosOrder = {
        dishes: cartData.dishes.map((d) => ({
          dish_id: d.dishId,
          instructions: d.instructions || "",
        })),
      };

      const url = `${API_BASE}/api/create_order/${clientId}/${restaurantId}`;

      const response = await axios.post(url, datosOrder, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Pedido Creado:", response.data);
      alert("¡Pedido realizado con éxito!");

      // Vaciar carrito
      sessionStorage.removeItem("carrito");
      setCartData(null);
      window.dispatchEvent(new Event("carritoActualizado"));

      // Navegar al restaurante
      navigate(`/restaurants/${encodeURIComponent(cartData.restaurantName)}`);
    } catch (error) {
      console.error("Error al crear el pedido:", error.response?.data || error.message);
      alert("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    if (cartData && cartData.restaurantName) {
      navigate(`/restaurants/${encodeURIComponent(cartData.restaurantName)}`);
    } else {
      navigate("/restaurants");
    }
  };

  if (!cartData || cartData.dishes.length === 0) {
    return (
      <div className="shopping-cart-container">
        <div className="empty-cart">
          <h2>🛒 Tu carrito está vacío</h2>
          <p>Añade platos desde nuestros restaurantes para continuar.</p>
          <button className="btn-continue-shopping" onClick={() => navigate("/restaurants")}>
            Ver Restaurantes
          </button>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="shopping-cart-container">
      <div className="cart-content">
        <h1>🛒 Resumen de tu pedido</h1>

        <div className="cart-restaurant">
          <h2>{cartData.restaurantName}</h2>
        </div>

        <div className="cart-items">
          <h3>Platos en tu pedido:</h3>
          {cartData.dishes.map((dish, index) => (
            <div key={dish.dishId} className="cart-item">
              <div className="item-header">
                <div className="item-image">
                  <img
                    src={dish.dishImage}
                    alt={dish.dishName}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100x100?text=Sin+imagen";
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{dish.dishName}</h4>
                  <p className="item-description">{dish.dishDescription}</p>
                  <p className="item-price">{dish.credits} Yameats</p>
                </div>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveDish(dish.dishId)}
                  title="Eliminar del carrito"
                >
                  ✕
                </button>
              </div>

              <div className="item-instructions">
                <label>Instrucciones especiales:</label>
                <textarea
                  value={dish.instructions}
                  onChange={(e) => handleUpdateInstructions(dish.dishId, e.target.value)}
                  placeholder="Ej: Sin cebolla, extra sal..."
                  rows={2}
                />
              </div>

              {dish.allergens && dish.allergens.length > 0 && (
                <div className="item-allergens">
                  <p className="allergens-label">Contiene alérgenos:</p>
                  <div className="allergens-list">
                    {dish.allergens.map((allergen, idx) => (
                      <span key={idx} className="allergen-badge">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{total} Yameats</span>
          </div>
          <div className="summary-row total">
            <span>Total a pagar:</span>
            <span>{total} Yameats</span>
          </div>
        </div>

        <div className="cart-actions">
          <button
            className="btn-place-order"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Confirmar Pedido"}
          </button>
          <button
            className="btn-continue-shopping"
            onClick={handleContinueShopping}
            disabled={loading}
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
