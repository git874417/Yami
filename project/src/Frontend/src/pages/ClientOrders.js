import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import "../css/ClientOrders.css";

const ClientOrders = () => {
  const [ordersData, setOrdersData] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchOrders = async () => {
      const clientId = sessionStorage.getItem("role_id");
      console.log("client_id desde sessionStorage:", clientId);
      if (!clientId) {
        setError("No se encontró el ID del cliente");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/api/client_orders/${clientId}`;
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
      setLoadingDetails((prev) => ({
        ...prev,
        [orderId]: false,
      }));
      return;
    }

    // Si no, cargar los detalles del pedido
    setLoadingDetails((prev) => ({
      ...prev,
      [orderId]: true,
    }));
    
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
    } finally {
      setLoadingDetails((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  const handleCancelOrder = async (orderId, orderStatus) => {
    if (orderStatus !== "Encargado") {
      alert("Solo se pueden cancelar pedidos en estado 'Encargado'");
      return;
    }

    const confirmed = window.confirm("¿Estás seguro de que deseas cancelar este pedido?");
    if (!confirmed) return;

    setCancellingOrder(orderId);
    try {
      const url = `${API_BASE}/api/cancel_order/${orderId}`;
      console.log("Cancelando pedido:", url);
      const response = await fetch(url, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status} al cancelar el pedido`);
      }

      const result = await response.json();
      console.log("Pedido cancelado:", result);
      
      // Actualizar la lista de pedidos
      setOrdersData((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId ? { ...order, order_status: "Cancelado" } : order
        ),
      }));

      alert("Pedido cancelado exitosamente");
    } catch (err) {
      console.error("Error cancelando pedido:", err);
      alert("Error al cancelar el pedido. Por favor, intenta de nuevo.");
    } finally {
      setCancellingOrder(null);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando tus pedidos..." />;
  }

  return (
    <main className="client-orders-page">
      <div className="client-orders-container">
        <header className="client-orders-header">
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Volver
          </button>
          <h1>Mis Pedidos</h1>
          {ordersData && <p className="orders-count">Total: {ordersData.total_orders} {ordersData.total_orders === 1 ? 'pedido' : 'pedidos'}</p>}
        </header>

        {error && <p className="error-message">Error: {error}</p>}

        <div className="client-orders-list">
          {ordersData?.orders?.length === 0 ? (
            <div className="no-orders-message">
              <p>No tienes pedidos aún</p>
              <button 
                className="btn-explore"
                onClick={() => navigate("/restaurants")}
              >
                Explorar Restaurantes
              </button>
            </div>
          ) : (
            ordersData?.orders?.map((order) => (
              <div key={order.id} className="client-order-card">
                <button
                  className="client-order-card-button"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="client-order-header-card">
                    <div className="client-order-info">
                      <h3>Pedido #{order.id}</h3>
                      <p className="client-order-restaurant">{order.restaurant_name || "Restaurante desconocido"}</p>
                      <span className={`order-status-badge status-${order.order_status?.toLowerCase()}`}>
                        {order.order_status || "Desconocido"}
                      </span>
                    </div>
                    <div className="client-order-summary">
                      <p className="client-order-credits">
                        {order.order_credits} {order.order_credits === 1 ? 'Yameat' : 'Yameats'}
                      </p>
                      <span className="expand-icon">
                        {expandedOrders[order.id] ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                </button>

                {loadingDetails[order.id] && (
                  <div className="client-order-details-expanded">
                    <div className="order-skeleton">
                      <div className="skeleton-line skeleton-line-long"></div>
                      <div className="skeleton-line skeleton-line-medium"></div>
                      <div className="skeleton-line skeleton-line-short"></div>
                      <div className="skeleton-line skeleton-line-medium"></div>
                      <div className="skeleton-dishes">
                        <div className="skeleton-dish"></div>
                        <div className="skeleton-dish"></div>
                        <div className="skeleton-dish"></div>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingDetails[order.id] && expandedOrders[order.id] && (
                  <div className="client-order-details-expanded">
                    <div className="client-order-details">
                      <p><strong>ID Pedido:</strong> {expandedOrders[order.id].order_id}</p>
                      <p><strong>Restaurante:</strong> {order.restaurant_name || "Desconocido"}</p>
                      <p><strong>Total:</strong> {expandedOrders[order.id].order_credits} {expandedOrders[order.id].order_credits === 1 ? 'Yameat' : 'Yameats'}</p>
                      <p><strong>Estado:</strong> {order.order_status || "Desconocido"}</p>
                    </div>

                    {expandedOrders[order.id].dishes && expandedOrders[order.id].dishes.length > 0 && (
                      <div className="client-order-items">
                        <h4>Platos pedidos:</h4>
                        <ul>
                          {expandedOrders[order.id].dishes.map((dish, index) => (
                            <li key={index} className="client-dish-item">
                              <span className="client-dish-name">{dish.dish_name}</span>
                              {dish.instructions && (
                                <span className="client-dish-instructions">
                                  Instrucciones: {dish.instructions}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {order.order_status === "Encargado" && (
                      <div className="order-actions">
                        <button
                          className="btn-cancel-order"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id, order.order_status);
                          }}
                          disabled={cancellingOrder === order.id}
                        >
                          {cancellingOrder === order.id ? "Cancelando..." : "Cancelar Pedido"}
                        </button>
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

export default ClientOrders;
