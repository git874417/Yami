import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import Modal from "../components/Modal";
import "../css/RestaurantOrders.css";

const RestaurantOrders = () => {
  const { restaurantId } = useParams();
  const [ordersData, setOrdersData] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchOrders = async (showLoading = true) => {
      const restaurantIdFromStorage = sessionStorage.getItem("role_id");
      console.log("role_id desde sessionStorage:", restaurantIdFromStorage);
      if (!restaurantIdFromStorage) {
        setModalState({
          isOpen: true,
          title: "Error",
          message: "No se encontró el ID del restaurante"
        });
        setLoading(false);
        return;
      }
      
      if (showLoading) {
        setLoading(true);
      }
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
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    // Cargar pedidos al montar el componente (con pantalla de carga)
    fetchOrders(true);

    // Configurar intervalo de actualización automática (cada 10 segundos, sin pantalla de carga)
    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 60000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
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
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error al cargar los detalles del pedido"
      });
    } finally {
      setLoadingDetails((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  const handleAcceptOrder = async (orderId, orderStatus) => {
    if (orderStatus !== "Encargado") {
      setModalState({
        isOpen: true,
        title: "Información",
        message: "Solo se pueden aceptar pedidos en estado 'Encargado'"
      });
      return;
    }

    setConfirmState({
      isOpen: true,
      title: "Confirmar acción",
      message: "¿Estás seguro de que deseas aceptar este pedido?",
      onConfirm: async () => {
        setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
        setProcessingOrder(orderId);
        try {
          const url = `${API_BASE}/api/update_order_status/${orderId}`;
          console.log("Aceptando pedido:", url);
          const response = await fetch(url, {
            method: 'PATCH',
          });

          if (!response.ok) {
            throw new Error(`Error ${response.status} al aceptar el pedido`);
          }

          const result = await response.json();
          console.log("Pedido aceptado:", result);
          
          // Actualizar la lista de pedidos
          setOrdersData((prev) => ({
            ...prev,
            orders: prev.orders.map((order) =>
              order.id === orderId ? { ...order, order_status: "En preparacion" } : order
            ),
          }));

          setModalState({
            isOpen: true,
            title: "Éxito",
            message: "Pedido aceptado exitosamente"
          });
        } catch (err) {
          console.error("Error aceptando pedido:", err);
          setModalState({
            isOpen: true,
            title: "Error",
            message: "Error al aceptar el pedido. Por favor, intenta de nuevo."
          });
        } finally {
          setProcessingOrder(null);
        }
      }
    });
  };

  const handleCancelOrder = async (orderId, orderStatus) => {
    if (orderStatus !== "Encargado") {
      setModalState({
        isOpen: true,
        title: "Información",
        message: "Solo se pueden cancelar pedidos en estado 'Encargado'"
      });
      return;
    }

    setConfirmState({
      isOpen: true,
      title: "Confirmar acción",
      message: "¿Estás seguro de que deseas cancelar este pedido?",
      onConfirm: async () => {
        setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
        setProcessingOrder(orderId);
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

          setModalState({
            isOpen: true,
            title: "Éxito",
            message: "Pedido cancelado exitosamente"
          });
        } catch (err) {
          console.error("Error cancelando pedido:", err);
          setModalState({
            isOpen: true,
            title: "Error",
            message: "Error al cancelar el pedido. Por favor, intenta de nuevo."
          });
        } finally {
          setProcessingOrder(null);
        }
      }
    });
  };

  const handleCompletePreparation = async (orderId, orderStatus) => {
    if (orderStatus !== "En preparacion") {
      setModalState({
        isOpen: true,
        title: "Información",
        message: "Solo se pueden completar pedidos en estado 'En preparacion'"
      });
      return;
    }

    setConfirmState({
      isOpen: true,
      title: "Confirmar acción",
      message: "¿Estás seguro de que la preparación está completada?",
      onConfirm: async () => {
        setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
        setProcessingOrder(orderId);
        try {
          const url = `${API_BASE}/api/update_order_status/${orderId}`;
          console.log("Completando preparación:", url);
          const response = await fetch(url, {
            method: 'PATCH',
          });

          if (!response.ok) {
            throw new Error(`Error ${response.status} al completar la preparación`);
          }

          const result = await response.json();
          console.log("Preparación completada:", result);
          
          // Actualizar la lista de pedidos
          setOrdersData((prev) => ({
            ...prev,
            orders: prev.orders.map((order) =>
              order.id === orderId ? { ...order, order_status: "En reparto" } : order
            ),
          }));

          setModalState({
            isOpen: true,
            title: "Éxito",
            message: "Preparación completada exitosamente"
          });
        } catch (err) {
          console.error("Error completando preparación:", err);
          setModalState({
            isOpen: true,
            title: "Error",
            message: "Error al completar la preparación. Por favor, intenta de nuevo."
          });
        } finally {
          setProcessingOrder(null);
        }
      }
    });
  };

  if (loading) {
    return <LoadingScreen message="Cargando pedidos..." />;
  }

  return (
    <main className="restaurant-orders-page">
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

      <div className="restaurant-orders-container">
        <header className="restaurant-orders-header">
          <button 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Volver
          </button>
          <h1>Pedidos del Restaurante</h1>
          {ordersData && <p className="orders-count">Total: {ordersData.total_orders} {ordersData.total_orders === 1 ? 'pedido' : 'pedidos'}</p>}
        </header>

        {error && <p className="error-message">Error: {error}</p>}

        <div className="restaurant-orders-list">
          {ordersData?.orders?.length === 0 ? (
            <div className="no-orders-message">
              <p>No hay pedidos aún</p>
            </div>
          ) : (
            ordersData?.orders?.map((order) => (
              <div key={order.id} className="restaurant-order-card">
                <button
                  className="restaurant-order-card-button"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="restaurant-order-header-card">
                    <div className="restaurant-order-info">
                      <h3>Pedido #{order.id}</h3>
                      <p className="restaurant-order-client">Cliente: {order.client_name || "Desconocido"}</p>
                      <span className={`order-status-badge status-${order.order_status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.order_status || "Desconocido"}
                      </span>
                    </div>
                    <div className="restaurant-order-summary">
                      <p className="restaurant-order-credits">
                        {order.order_credits} 🍽️
                      </p>
                      <span className="expand-icon">
                        {expandedOrders[order.id] ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                </button>

                {loadingDetails[order.id] && (
                  <div className="restaurant-order-details-expanded">
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
                  <div className="restaurant-order-details-expanded">
                    <div className="restaurant-order-details">
                      <p><strong>ID Orden:</strong> {expandedOrders[order.id].order_id}</p>
                      <p><strong>Cliente:</strong> {order.client_name || "Desconocido"}</p>
                      <p><strong>Restaurante:</strong> {order.restaurant_name || "Desconocido"}</p>
                      <p><strong>Total:</strong> {expandedOrders[order.id].order_credits} 🍽️</p>
                      <p><strong>Estado:</strong> {order.order_status || "Desconocido"}</p>
                    </div>

                    {expandedOrders[order.id].dishes && expandedOrders[order.id].dishes.length > 0 && (
                      <div className="restaurant-order-items">
                        <h4>Platos pedidos:</h4>
                        <ul>
                          {expandedOrders[order.id].dishes.map((dish, index) => (
                            <li key={index} className="restaurant-dish-item">
                              <span className="restaurant-dish-name">{dish.dish_name}</span>
                              {dish.instructions && (
                                <span className="restaurant-dish-instructions">
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
                          className="btn-accept-order"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptOrder(order.id, order.order_status);
                          }}
                          disabled={processingOrder === order.id}
                        >
                          {processingOrder === order.id ? "Procesando..." : "Aceptar Pedido"}
                        </button>
                        <button
                          className="btn-cancel-order"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id, order.order_status);
                          }}
                          disabled={processingOrder === order.id}
                        >
                          {processingOrder === order.id ? "Procesando..." : "Cancelar Pedido"}
                        </button>
                      </div>
                    )}

                    {order.order_status === "En preparacion" && (
                      <div className="order-actions">
                        <button
                          className="btn-complete-preparation"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompletePreparation(order.id, order.order_status);
                          }}
                          disabled={processingOrder === order.id}
                        >
                          {processingOrder === order.id ? "Procesando..." : "Preparación Completada"}
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

export default RestaurantOrders;
