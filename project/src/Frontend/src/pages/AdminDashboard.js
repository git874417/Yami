import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("clientes"); // "clientes" o "restaurantes"
  const [clientes, setClientes] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // Verificar que es admin
    const role = sessionStorage.getItem("role");
    if (role !== "Admin" && role !== "admin") {
      navigate("/");
      return;
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, restaurantsRes] = await Promise.all([
        fetch(`${API_BASE}/api/clients/full_info`),
        fetch(`${API_BASE}/api/restaurants/full_info`)
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClientes(clientsData.clients || []);
      }

      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json();
        setRestaurantes(restaurantsData.restaurants || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error al cargar los datos"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = (clientId, clientName) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar al cliente ${clientName}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
        try {
          const response = await fetch(`${API_BASE}/api/delete_client/${clientId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            throw new Error("Error al eliminar cliente");
          }

          setClientes(clientes.filter(c => c.id !== clientId));
          setModalState({
            isOpen: true,
            title: "Éxito",
            message: "Cliente eliminado correctamente"
          });
        } catch (error) {
          console.error("Error:", error);
          setModalState({
            isOpen: true,
            title: "Error",
            message: "Error al eliminar el cliente"
          });
        }
      }
    });
  };

  const handleDeleteRestaurant = (restaurantId, restaurantName) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar el restaurante ${restaurantName}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
        try {
          const response = await fetch(`${API_BASE}/api/delete_restaurant/${restaurantId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            throw new Error("Error al eliminar restaurante");
          }

          setRestaurantes(restaurantes.filter(r => r.id !== restaurantId));
          setModalState({
            isOpen: true,
            title: "Éxito",
            message: "Restaurante eliminado correctamente"
          });
        } catch (error) {
          console.error("Error:", error);
          setModalState({
            isOpen: true,
            title: "Error",
            message: "Error al eliminar el restaurante"
          });
        }
      }
    });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <p className="loading-message">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
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

      <div className="admin-container">
        <header className="admin-header">
          <h1>Panel de Administración</h1>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </header>

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "clientes" ? "active" : ""}`}
            onClick={() => setActiveTab("clientes")}
          >
            Clientes ({clientes.length})
          </button>
          <button
            className={`tab-button ${activeTab === "restaurantes" ? "active" : ""}`}
            onClick={() => setActiveTab("restaurantes")}
          >
            Restaurantes ({restaurantes.length})
          </button>
        </div>

        <div className="admin-content">
          {activeTab === "clientes" && (
            <div className="clients-section">
              <h2>Gestión de Clientes</h2>
              {clientes.length === 0 ? (
                <p className="no-data">No hay clientes registrados</p>
              ) : (
                <div className="clients-grid">
                  {clientes.map((item) => (
                    <div key={item.client.id} className="client-card">
                      <div className="card-header">
                        <h3>{item.client.name} {item.client.surname}</h3>
                        <span className="badge">{item.client.sub_plan}</span>
                      </div>
                      <div className="card-info">
                        <p><strong>Email:</strong> {item.user?.email || "N/A"}</p>
                        <p><strong>Teléfono:</strong> {item.client.phone_number}</p>
                        <p><strong>Ciudad:</strong> {item.client.city}</p>
                        <p><strong>Créditos:</strong> {item.client.available_credits}</p>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn-view-orders"
                          onClick={() => navigate(`/admin/cliente/${item.client.id}/pedidos`)}
                        >
                          Ver Pedidos
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteClient(item.client.id, `${item.client.name} ${item.client.surname}`)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "restaurantes" && (
            <div className="restaurants-section">
              <h2>Gestión de Restaurantes</h2>
              {restaurantes.length === 0 ? (
                <p className="no-data">No hay restaurantes registrados</p>
              ) : (
                <div className="restaurants-grid">
                  {restaurantes.map((item) => (
                    <div key={item.restaurant.id} className="restaurant-card">
                      <div className="card-header">
                        <h3>{item.restaurant.name}</h3>
                        <span className="category-badge">{item.restaurant.category}</span>
                      </div>
                      <div className="card-info">
                        <p><strong>Email:</strong> {item.user?.email || "N/A"}</p>
                        <p><strong>Teléfono:</strong> {item.restaurant.phone_number}</p>
                        <p><strong>Ciudad:</strong> {item.restaurant.city}</p>
                        <p><strong>Descripción:</strong> {item.restaurant.description.substring(0, 60)}...</p>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn-view-orders"
                          onClick={() => navigate(`/admin/restaurante/${item.restaurant.id}/pedidos`)}
                        >
                          Ver Pedidos
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteRestaurant(item.restaurant.id, item.restaurant.name)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
