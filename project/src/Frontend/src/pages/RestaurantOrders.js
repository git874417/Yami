import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/RestaurantOrders.css";

const RestaurantOrders = () => {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchOrders = async () => {
      const restaurantIdFromStorage = sessionStorage.getItem("role_id");
      console.log("role_id desde sessionStorage:", restaurantIdFromStorage);
      if (!restaurantIdFromStorage) {
        setError("No se encontró el ID del restaurante");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/api/restaurant_orders/${restaurantIdFromStorage}`;
        console.log("Llamando a:", url);
        const response = await fetch(url, {
          method: 'GET',
        });

        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`Error ${response.status} al cargar los pedidos`);
        }

        const ordersData = await response.json();
        console.log("Pedidos recibidos:", ordersData);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_BASE]);

  const getFilteredOrders = () => {
    if (filterStatus === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === filterStatus);
  };

  const filteredOrders = getFilteredOrders();

  const getStatusColor = (status) => {
    switch (status) {
      case "pendiente":
        return "#ffc107";
      case "en_preparacion":
        return "#17a2b8";
      case "listo":
        return "#28a745";
      case "entregado":
        return "#6c757d";
      case "cancelado":
        return "#dc3545";
      default:
        return "#666";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES") + " " + date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateString;
    }
  };

  return (
    <main className="orders-page">
      <div className="orders-container">
        <header className="orders-header">
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Volver
          </button>
          <h1>Pedidos del Restaurante</h1>
        </header>

        <div className="orders-controls">
          <button 
            className={`filter-button ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            Todos
          </button>
          <button 
            className={`filter-button ${filterStatus === "pendiente" ? "active" : ""}`}
            onClick={() => setFilterStatus("pendiente")}
          >
            Pendiente
          </button>
          <button 
            className={`filter-button ${filterStatus === "en_preparacion" ? "active" : ""}`}
            onClick={() => setFilterStatus("en_preparacion")}
          >
            En Preparación
          </button>
          <button 
            className={`filter-button ${filterStatus === "listo" ? "active" : ""}`}
            onClick={() => setFilterStatus("listo")}
          >
            Listo
          </button>
          <button 
            className={`filter-button ${filterStatus === "entregado" ? "active" : ""}`}
            onClick={() => setFilterStatus("entregado")}
          >
            Entregado
          </button>
          <button 
            className={`filter-button ${filterStatus === "cancelado" ? "active" : ""}`}
            onClick={() => setFilterStatus("cancelado")}
          >
            Cancelado
          </button>
        </div>

        {loading && <p className="status-message">Cargando pedidos...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        <div className="orders-list">
          {filteredOrders.length === 0 && !loading ? (
            <p className="no-results">No se encontraron pedidos</p>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header-card">
                  <div className="order-info">
                    <h3>Pedido #{order.id}</h3>
                    <p className="order-date">{formatDate(order.created_at)}</p>
                  </div>
                  <div 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="order-details">
                  <p><strong>Cliente:</strong> {order.client_name || "No disponible"}</p>
                  <p><strong>Total:</strong> ${order.total || "0.00"}</p>
                  {order.delivery_address && (
                    <p><strong>Dirección:</strong> {order.delivery_address}</p>
                  )}
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <h4>Productos:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.dish_name} x{item.quantity} - ${item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default RestaurantOrders;
