import React, {useState, useEffect} from "react";
import {useParams, useNavigate, useLocation, data} from "react-router-dom";
import Modal from "../components/Modal";
import "../css/OrderDish.css";
import axios from "axios";

const OrderDish = () => {
  const {restaurantId: restaurantNameUrl, dishName} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get dish data from navigation state
  const dishFromState = location.state?.dish;
  const restaurantFromState = location.state?.restaurant;

  // Convert allergens string to array if necessary
  const getAllergens = (allergens) => {
    if (!allergens) return [];
    if (Array.isArray(allergens)) return allergens;
    if (typeof allergens === "string") {
      return allergens
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
    return [];
  };

  const [orderData, setOrderData] = useState({
    dishId: dishFromState?.id || null,
    dishName: dishFromState?.name || "",
    dishDescription: dishFromState?.description || "",
    credits: dishFromState?.credits || 0,
    instructions: "",
    allergens: getAllergens(dishFromState?.allergens),
    dishImage: dishFromState?.image_url || "https://via.placeholder.com/800x600?text=Cargando...",
  });

  const [loading, setLoading] = useState(!dishFromState);
  const [error, setError] = useState(null);
  const [availableCredits, setAvailableCredits] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  // Obtener los créditos disponibles del cliente
  useEffect(() => {
    const fetchClientCredits = async () => {
      const clientId = sessionStorage.getItem("role_id");
      if (clientId) {
        try {
          const response = await axios.get(`${API_BASE}/api/client/${clientId}`);
          setAvailableCredits(response.data.available_credits);
        } catch (error) {
          console.error("Error fetching client credits:", error);
        }
      }
    };
    fetchClientCredits();
  }, [API_BASE]);

  // Cargar datos del plato desde el backend solo si no vienen del state
  useEffect(() => {
    // Si ya tenemos los datos del plato del state, no hacer fetch
    if (dishFromState) {
      console.log("Using dish data from state:", dishFromState);
      setLoading(false);
      return;
    }

    // Si no tenemos los datos, hacer fetch por nombre del plato
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!dishName || !restaurantNameUrl) {
          throw new Error("No se encontró información del plato");
        }

        console.log("Fetching dish by name:", dishName, "from restaurant:", restaurantNameUrl);

        // Primero obtener los platos del restaurante
        const encodedRestaurantName = encodeURIComponent(restaurantNameUrl);
        const response = await fetch(`${API_BASE}/restaurants/name/${encodedRestaurantName}/dishes`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los platos`);
        }

        const dishes = await response.json();
        console.log("Dishes received:", dishes);

        // Buscar el plato por nombre
        const dish = dishes.find((d) => d.name === decodeURIComponent(dishName));

        if (!dish) {
          throw new Error("No se encontró el plato");
        }

        console.log("Found dish:", dish);

        // Actualizar el estado con los datos del plato
        setOrderData({
          dishName: dish.name,
          dishDescription: dish.description,
          credits: dish.credits,
          instructions: "",
          allergens: getAllergens(dish.allergens),
          dishImage:
            dish.image_url ||
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
        });
      } catch (error) {
        console.error("Error fetching order data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [dishFromState, dishName, restaurantNameUrl, API_BASE]);

  const handleAddToCart = () => {
    const clientId = sessionStorage.getItem("role_id");
    if (!clientId) {
      setModalState({
        isOpen: true,
        title: "Información",
        message: "Por favor, inicia sesión para realizar un pedido."
      });
      setTimeout(() => navigate("/inicio-sesion"), 1500);
      return;
    }

    if (!orderData.dishId || !restaurantFromState?.id) {
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error: Faltan datos del plato o restaurante."
      });
      return;
    }

    try {
      // Obtener carrito actual
      const carritoActual = JSON.parse(sessionStorage.getItem("carrito") || "{}");
      
      // Restaurante ID del carrito
      const restaurantIdInCart = carritoActual.restaurantId;
      
      // Verificar si el carrito pertenece a otro restaurante
      if (restaurantIdInCart && restaurantIdInCart !== restaurantFromState.id) {
        setConfirmState({
          isOpen: true,
          title: "Cambiar restaurante",
          message: "Ya tienes items de otro restaurante. Si cambias de restaurante, se vaciará el carrito actual. ¿Deseas continuar?",
          onConfirm: async () => {
            setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
            
            // Vaciar carrito y empezar uno nuevo
            sessionStorage.setItem("carrito", JSON.stringify({
              restaurantId: restaurantFromState.id,
              restaurantName: restaurantFromState.name,
              dishes: [
                {
                  dishId: orderData.dishId,
                  dishName: orderData.dishName,
                  dishDescription: orderData.dishDescription,
                  credits: orderData.credits,
                  instructions: orderData.instructions,
                  dishImage: orderData.dishImage,
                  allergens: orderData.allergens,
                },
              ],
            }));

            window.dispatchEvent(new Event("carritoActualizado"));
            navigate(`/restaurants/${encodeURIComponent(restaurantFromState.name)}`, {
              state: { restaurant: restaurantFromState }
            });
          }
        });
        return;
      }
      
      // Agregar al carrito existente o crear uno nuevo
      const nuevoCarrito = {
        restaurantId: restaurantFromState.id,
        restaurantName: restaurantFromState.name,
        dishes: carritoActual.dishes || [],
      };

      nuevoCarrito.dishes.push({
          dishId: orderData.dishId,
          dishName: orderData.dishName,
          dishDescription: orderData.dishDescription,
          credits: orderData.credits,
          instructions: orderData.instructions,
          dishImage: orderData.dishImage,
          allergens: orderData.allergens,
      });
      setModalState({
        isOpen: true,
        title: "Éxito",
        message: `✓ ${orderData.dishName} añadido al carrito`
      });

      sessionStorage.setItem("carrito", JSON.stringify(nuevoCarrito));

      // Disparar evento para actualizar el Header (contador del carrito)
      window.dispatchEvent(new Event("carritoActualizado"));

      // Volver a Restaurant_Dishes del mismo restaurante después de 1.5 segundos
      setTimeout(() => {
        navigate(`/restaurants/${encodeURIComponent(restaurantFromState.name)}`, {
          state: { restaurant: restaurantFromState }
        });
      }, 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error al añadir al carrito"
      });
    }
  };

  // const handleAddToCart = async () => {
  //   try {
  //     // Obtener el dish_id desde el estado o desde el dishFromState
  //     const dishId = dishFromState?.id || null;

  //     if (!dishId) {
  //       alert("Error: No se pudo obtener el ID del plato");
  //       return;
  //     }

  //     const newItem = {
  //       dish_id: dishId,
  //       instructions: orderData.instructions,
  //       restaurant_id: restaurantId,
  //     };

  //     // Obtener carrito existente
  //     const carritoActual = JSON.parse(sessionStorage.getItem("carrito") || "[]");

  //     // Verificar si el plato ya existe en el carrito
  //     const indiceExistente = carritoActual.findIndex((p) => p.dish_id === newItem.dish_id);

  //     if (indiceExistente >= 0) {
  //       // Si existe, solo actualizar instrucciones (o incrementar cantidad si la tuviera)
  //       carritoActual[indiceExistente].instructions = newItem.instructions;
  //       alert(`✓ ${orderData.dishName} ya estaba en el carrito. Instrucciones actualizadas.`);
  //     } else {
  //       // Si no existe, añadir nuevo
  //       carritoActual.push(newItem);
  //       alert("✓ Plato añadido al carrito");
  //     }

  //     sessionStorage.setItem("carrito", JSON.stringify(carritoActual));

  //     // Disparar evento para actualizar el Header (contador del carrito)
  //     window.dispatchEvent(new Event("carritoActualizado"));
  //   } catch (error) {
  //     console.error("Error adding to cart:", error);
  //     alert("Error al añadir al carrito");
  //   }
  // };

  const getAllergenIcon = (allergen) => {
    const icons = {
      Gluten: "🌾",
      Huevos: "🥚",
      Huevo: "🥚",
      Lácteos: "🥛",
      Lactosa: "🥛",
      Pescado: "🐟",
      Soja: "🌱",
      "Frutos de Cáscara": "�",
      Nueces: "🥜",
      Cacahuetes: "🥜",
      Moluscos: "�",
      Mostaza: "🌭",
      "Granos de Sésamo": "🌾",
      Sésamo: "🌾",
      "Dióxido de Azufre y Sulfitos": "💨",
      Sulfitos: "�",
      Crustáceos: "🦐",
      Marisco: "🦐",
    };
    return icons[allergen] || "⚠️";
  };

  if (loading) {
    return (
      <div className="order-dish-container">
        <div className="loading-container">
          <p>Cargando plato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-dish-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-dish-container">
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, title: "", message: "" })}
        title={modalState.title}
        actions={[
          {
            label: "Cerrar",
            onClick: () => setModalState({ isOpen: false, title: "", message: "" })
          }
        ]}
      >
        <p>{modalState.message}</p>
      </Modal>

      <Modal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null })}
        title={confirmState.title}
        actions={[
          {
            label: "Cancelar",
            onClick: () => setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null }),
            className: "cancel"
          },
          {
            label: "Confirmar",
            onClick: confirmState.onConfirm,
            className: "confirm"
          }
        ]}
      >
        <p>{confirmState.message}</p>
      </Modal>

      {/* Main Content */}
      <div className="order-content">
        {/* Imagen del plato */}
        <div className="dish-image-container">
          <img
            src={orderData.dishImage}
            alt={orderData.dishName}
            className="dish-image"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x600?text=Imagen+no+disponible";
            }}
          />
        </div>

        {/* Información del plato */}
        <div className="dish-info">
          <h1 className="dish-title">{orderData.dishName}</h1>
          <p className="dish-description">{orderData.dishDescription}</p>

          <div className="dish-credits">
            {orderData.credits} {orderData.credits === 1 ? 'Yameat' : 'Yameats'} {availableCredits !== null && `(${availableCredits} ${availableCredits === 1 ? 'disponible' : 'disponibles'})`}
          </div>

          {/* Instrucciones */}
          <div className="instructions-section">
            <label htmlFor="instructions" className="instructions-label">
              Instrucciones
            </label>
            <textarea
              id="instructions"
              className="instructions-input"
              placeholder="Solicite instrucciones al Restaurante"
              value={orderData.instructions}
              onChange={(e) => setOrderData({...orderData, instructions: e.target.value})}
              rows={4}
            />
          </div>

          {/* Botón añadir al carrito */}
          <button className="btn-add-cart" onClick={handleAddToCart}>
            Añadir al carrito
          </button>

          {/* Alérgenos */}
          <div className="allergens-section">
            <p className="allergens-label">Alérgenos:</p>
            <div className="allergens-list">
              {orderData.allergens.map((allergen, index) => (
                <div key={index} className="allergen-badge">
                  <span className="allergen-icon">{getAllergenIcon(allergen)}</span>
                  <span className="allergen-name">{allergen}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDish;
