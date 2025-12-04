import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Modal from "../components/Modal";
import "../css/ShoppingCart.css";
import axios from "axios";

const ShoppingCart = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({isOpen: false, title: "", message: ""});
  const [clientCredits, setClientCredits] = useState(0);
  const navigate = useNavigate();

  const API_BASE = "";

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

    // Cargar créditos disponibles del cliente
    const clientId = sessionStorage.getItem("role_id");
    if (clientId) {
      fetchClientCredits(clientId);
    }
  }, []);

  const fetchClientCredits = async (clientId) => {
    try {
      const response = await axios.get(`/api/client/${clientId}`);
      setClientCredits(response.data.available_credits || 0);
    } catch (error) {
      console.error("Error fetching client credits:", error);
      setClientCredits(0);
    }
  };

  const handleRemoveDish = (index) => {
    if (!cartData) return;

    const updatedDishes = cartData.dishes.filter((_, i) => i !== index);

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
      d.dishId === dishId ? {...d, instructions: newInstructions} : d
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
      setModalState({
        isOpen: true,
        title: "Información",
        message: "Por favor, inicia sesión para realizar un pedido.",
      });
      setTimeout(() => navigate("/inicio-sesion"), 1500);
      return;
    }

    if (!cartData || cartData.dishes.length === 0) {
      setModalState({
        isOpen: true,
        title: "Información",
        message: "El carrito está vacío.",
      });
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
        headers: {"Content-Type": "application/json"},
      });

      console.log("Pedido Creado:", response.data);
      setModalState({
        isOpen: true,
        title: "Éxito",
        message: "¡Pedido realizado con éxito!",
      });

      // Vaciar carrito
      sessionStorage.removeItem("carrito");
      setCartData(null);
      window.dispatchEvent(new Event("carritoActualizado"));

      // Navegar al restaurante después de cerrar el modal
      setTimeout(() => {
        navigate(`/restaurants/${encodeURIComponent(cartData.restaurantName)}`);
      }, 1500);
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      
      // Obtener el mensaje de error del servidor
      const errorDetail = error.response?.data?.detail || error.message || "Hubo un error al procesar tu pedido";
      const statusCode = error.response?.status || 0;
      
      // Verificar si el error es por creditos insuficientes
      const isInsufficientCredits = errorDetail.toLowerCase().includes("creditos") || 
                                   errorDetail.toLowerCase().includes("insufficient") ||
                                   errorDetail.toLowerCase().includes("credito") ||
                                   errorDetail.toLowerCase().includes("yameats");
      
      if (isInsufficientCredits) {
        setModalState({
          isOpen: true,
          title: "⚠️ Créditos Insuficientes",
          message: errorDetail || "No tienes suficientes créditos para realizar este pedido. Por favor, recarga tu cuenta.",
        });
      } else if (statusCode === 400) {
        // Errores de validacion (400)
        setModalState({
          isOpen: true,
          title: "Error en la validación",
          message: errorDetail,
        });
      } else {
        setModalState({
          isOpen: true,
          title: "Error",
          message: errorDetail,
        });
      }
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
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({isOpen: false, title: "", message: ""})}
        title={modalState.title}
        actions={[
          {
            label: "Cerrar",
            onClick: () => setModalState({isOpen: false, title: "", message: ""}),
          },
        ]}
      >
        <p>{modalState.message}</p>
      </Modal>
      <div className="cart-content">
        <h1>🛒 Resumen de tu pedido</h1>

        <div className="cart-restaurant">
          <h2>{cartData.restaurantName}</h2>
        </div>

        <div className="cart-items">
          <h3>Platos en tu pedido:</h3>
          {cartData.dishes.map((dish, index) => (
            <div key={`${dish.dishId}-${index}`} className="cart-item">
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
                  onClick={() => handleRemoveDish(index)}
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
          <div className="summary-row remaining-credits">
            <span>Yameats restantes después del pedido:</span>
            <span className={clientCredits - total >= 0 ? "positive" : "negative"}>
              {clientCredits - total} Yameats
            </span>
          </div>
        </div>

        <div className="cart-actions">
          <button className="btn-place-order" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar Pedido"}
          </button>
          <button className="btn-continue-shopping" onClick={handleContinueShopping} disabled={loading}>
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
