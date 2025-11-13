import React, {useState, useEffect} from "react";
import {useParams, useNavigate, useLocation, data} from "react-router-dom";
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

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

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

  const handleCreateOrder = async () => {
    const clientId = sessionStorage.getItem("role_id");
    if (!clientId) {
      alert("Por favor, inicia sesión para realizar un pedido.");
      navigate("/inicio-sesion");
      return;
    }
    const clientIdNumber = Number(clientId);
    const restaurantId_numerico = Number(restaurantFromState?.id);

    if (!clientIdNumber || !restaurantId_numerico || !orderData.dishId) {
      alert("Error: Faltan datos clave (usuario, restaurante o plato) para crear el pedido.");
      console.error("IDs faltantes:", {clientId: clientIdNumber, restaurantId_numerico, dishId: orderData.dishId});
      return;
    }

    // Backend expects only the OrderCreate body: { dishes: [ { dish_id, instructions } ] }
    const datosOrder = {
      dishes: [
        {
          dish_id: Number(orderData.dishId),
          instructions: orderData.instructions || "",
        },
      ],
    };
    const url = `http://127.0.0.1:8000/api/create_order/${clientId}/${restaurantId_numerico}`;
    try {
      const response = await axios.post(url, datosOrder, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Pedido Creado:", response.data);
      alert("¡Pedido realizado con éxito!");

      navigate(`/restaurants/${restaurantNameUrl}`);
    } catch (error) {
      console.error("Error al crear el pedido:", error.response?.data || error.message);
      alert("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
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
            <strong>{orderData.credits} Yameats</strong>
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
          <button className="btn-add-cart" onClick={handleCreateOrder}>
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
