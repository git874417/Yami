import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/RestaurantOrders.css";

const RestaurantOrders = () => {
  const { restaurantId } = useParams();
  const [ordersData, setOrdersData] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
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

        const data = await response.json();
        console.log("Datos recibidos:", data);
        setOrdersData(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_BASE]);

  const toggleOrderDetails = async (orderId) => {
    // Si ya está expandido, contraerlo
    if (expandedOrders[orderId]) {
      setExpandedOrders((prev) => ({
        ...prev,
        [orderId]: null,
      }));
      return;
    }

    // Si no, cargar los detalles del pedido
    try {
      const url = `${API_BASE}/api/order/${orderId}/details`;
      console.log("Cargando detalles de orden:", url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar los detalles`);
      }
      const orderDetails = await response.json();
      console.log("Detalles cargados:", orderDetails);
      setExpandedOrders((prev) => ({
        ...prev,
        [orderId]: orderDetails,
      }));
    } catch (err) {
      console.error("Error cargando detalles:", err);
      alert("Error al cargar los detalles del pedido");
    }
  };

  const filteredOrders = !ordersData?.orders 
    ? [] 
    : ordersData.orders.filter((order) => {
        if (filterStatus === "all") return true;
        return order.status === filterStatus;
      });

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
          {ordersData && <p className="orders-count">Total: {ordersData.total_orders} pedidos</p>}
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
                <button
                  className="order-card-button"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="order-header-card">
                    <div className="order-info">
                      <h3>Pedido #{order.id}</h3>
                      <p className="order-client">Cliente ID: {order.client_id}</p>
                    </div>
                    <div className="order-summary">
                      <p className="order-credits">{order.order_credits} 🍽️</p>
                      <span className="expand-icon">
                        {expandedOrders[order.id] ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                </button>

                {expandedOrders[order.id] && (
                  <div className="order-details-expanded">
                    <div className="order-details">
                      <p><strong>ID Orden:</strong> {expandedOrders[order.id].order_id}</p>
                      <p><strong>Cliente ID:</strong> {expandedOrders[order.id].client_id}</p>
                      <p><strong>Restaurante ID:</strong> {expandedOrders[order.id].restaurant_id}</p>
                      <p><strong>Total:</strong> {expandedOrders[order.id].order_credits} 🍽️</p>
                    </div>

                    {expandedOrders[order.id].dishes && expandedOrders[order.id].dishes.length > 0 && (
                      <div className="order-items">
                        <h4>Platos:</h4>
                        <ul>
                          {expandedOrders[order.id].dishes.map((dish, index) => (
                            <li key={index} className="dish-item">
                              <span className="dish-name">{dish.dish_name}</span>
                              {dish.instructions && (
                                <span className="dish-instructions">Instrucciones: {dish.instructions}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
