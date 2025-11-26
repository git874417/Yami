import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import Modal from "../components/Modal";
import "../css/AdminRestaurantOrders.css";

const AdminRestaurantOrders = () => {
  const {restaurantId} = useParams();
  const [ordersData, setOrdersData] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({isOpen: false, title: "", message: ""});
  const navigate = useNavigate();
  const API_BASE = "";

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    if (role !== "Admin" && role !== "admin") {
      navigate("/");
      return;
    }

    fetchOrders();
  }, [API_BASE, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/api/restaurant_orders/${restaurantId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar los pedidos`);
      }

      const data = await response.json();
      setOrdersData(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = async (orderId) => {
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

    setLoadingDetails((prev) => ({
      ...prev,
      [orderId]: true,
    }));

    try {
      const url = `${API_BASE}/api/order/${orderId}/details`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar los detalles`);
      }
      const orderDetails = await response.json();
      setExpandedOrders((prev) => ({
        ...prev,
        [orderId]: orderDetails,
      }));
    } catch (err) {
      console.error("Error cargando detalles:", err);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error al cargar los detalles del pedido",
      });
    } finally {
      setLoadingDetails((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando pedidos del restaurante..." />;
  }

  return (
    <main className="admin-orders-page">
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

      <div className="admin-orders-container">
        <header className="admin-orders-header">
          <button onClick={() => navigate("/admin")} className="back-button">
            ← Volver
          </button>
          <h1>Pedidos del Restaurante</h1>
          {ordersData && (
            <p className="orders-count">
              Total: {ordersData.total_orders} {ordersData.total_orders === 1 ? "pedido" : "pedidos"}
            </p>
          )}
        </header>

        {error && <p className="error-message">Error: {error}</p>}

        <div className="admin-orders-list">
          {ordersData?.orders?.length === 0 ? (
            <div className="no-orders-message">
              <p>Este restaurante no tiene pedidos</p>
            </div>
          ) : (
            ordersData?.orders?.map((order) => (
              <div key={order.id} className="admin-order-card">
                <button className="admin-order-card-button" onClick={() => toggleOrderDetails(order.id)}>
                  <div className="admin-order-header-card">
                    <div className="admin-order-info">
                      <h3>Pedido #{order.id}</h3>
                      <p className="admin-order-client">{order.client_name || "Cliente desconocido"}</p>
                      <span
                        className={`order-status-badge status-${order.order_status
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {order.order_status || "Desconocido"}
                      </span>
                    </div>
                    <div className="admin-order-summary">
                      <p className="admin-order-credits">{order.order_credits} 🍽️</p>
                      <span className="expand-icon">{expandedOrders[order.id] ? "▼" : "▶"}</span>
                    </div>
                  </div>
                </button>

                {loadingDetails[order.id] && (
                  <div className="admin-order-details-expanded">
                    <div className="order-skeleton">
                      <div className="skeleton-line skeleton-line-long"></div>
                      <div className="skeleton-line skeleton-line-medium"></div>
                      <div className="skeleton-line skeleton-line-short"></div>
                      <div className="skeleton-dishes">
                        <div className="skeleton-dish"></div>
                        <div className="skeleton-dish"></div>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingDetails[order.id] && expandedOrders[order.id] && (
                  <div className="admin-order-details-expanded">
                    <div className="admin-order-details">
                      <p>
                        <strong>ID Pedido:</strong> {expandedOrders[order.id].order_id}
                      </p>
                      <p>
                        <strong>Cliente:</strong> {order.client_name || "Desconocido"}
                      </p>
                      <p>
                        <strong>Total:</strong> {expandedOrders[order.id].order_credits} 🍽️
                      </p>
                      <p>
                        <strong>Estado:</strong> {order.order_status || "Desconocido"}
                      </p>
                    </div>

                    {expandedOrders[order.id].dishes && expandedOrders[order.id].dishes.length > 0 && (
                      <div className="admin-order-items">
                        <h4>Platos pedidos:</h4>
                        <ul>
                          {expandedOrders[order.id].dishes.map((dish, index) => (
                            <li key={index} className="admin-dish-item">
                              <span className="admin-dish-name">{dish.dish_name}</span>
                              {dish.instructions && (
                                <span className="admin-dish-instructions">
                                  Instrucciones: {dish.instructions}
                                </span>
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

export default AdminRestaurantOrders;
