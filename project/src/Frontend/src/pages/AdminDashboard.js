import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import Modal from "../components/Modal";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("clientes"); // "clientes" o "restaurantes"
  const [clientes, setClientes] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [clientesOriginales, setClientesOriginales] = useState([]);
  const [restaurantesOriginales, setRestaurantesOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({isOpen: false, title: "", message: ""});
  const [confirmState, setConfirmState] = useState({isOpen: false, title: "", message: "", onConfirm: null});
  const [adminName, setAdminName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // Verificar que es admin
    const role = sessionStorage.getItem("role");
    if (role !== "Admin" && role !== "admin") {
      navigate("/");
      return;
    }

    // Obtener el nombre del admin del email
    const email = sessionStorage.getItem("email");
    console.log("Email from sessionStorage:", email);

    if (email) {
      // Formato: nombre.apellido@yami.com -> extraer "nombre"
      const adminNameFromEmail = email.split("@")[0].split(".")[0];
      const capitalizedName =
        adminNameFromEmail.charAt(0).toUpperCase() + adminNameFromEmail.slice(1).toLowerCase();
      console.log("Admin name:", capitalizedName);
      setAdminName(capitalizedName);
    } else {
      console.log("No email found in sessionStorage");
      setAdminName("Admin");
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, restaurantsRes] = await Promise.all([
        fetch(`${API_BASE}/api/clients/full_info`),
        fetch(`${API_BASE}/api/restaurants/full_info`),
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        const clientsList = clientsData.clients || [];
        setClientes(clientsList);
        setClientesOriginales(clientsList);
      }

      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json();
        const restaurantsList = restaurantsData.restaurants || [];
        setRestaurantes(restaurantsList);
        setRestaurantesOriginales(restaurantsList);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error al cargar los datos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);

    if (activeTab === "clientes") {
      if (!search) {
        setClientes(clientesOriginales);
      } else {
        const filtered = clientesOriginales.filter(
          (item) =>
            item.client.name.toLowerCase().includes(search) ||
            item.client.surname.toLowerCase().includes(search) ||
            item.user?.email.toLowerCase().includes(search)
        );
        setClientes(filtered);
      }
    } else {
      if (!search) {
        setRestaurantes(restaurantesOriginales);
      } else {
        const filtered = restaurantesOriginales.filter(
          (item) =>
            item.restaurant.name.toLowerCase().includes(search) ||
            item.user?.email.toLowerCase().includes(search)
        );
        setRestaurantes(filtered);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    if (tab === "clientes") {
      setClientes(clientesOriginales);
    } else {
      setRestaurantes(restaurantesOriginales);
    }
  };

  const handleDeleteClient = (clientId, clientName) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar al cliente ${clientName}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmState({isOpen: false, title: "", message: "", onConfirm: null});
        try {
          const response = await fetch(`${API_BASE}/api/delete_client/${clientId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Error al eliminar cliente");
          }

          setClientes(clientes.filter((c) => c.id !== clientId));
          setModalState({
            isOpen: true,
            title: "Éxito",
            message: "Cliente eliminado correctamente",
          });
        } catch (error) {
          console.error("Error:", error);
          setModalState({
            isOpen: true,
            title: "Error",
            message: "Error al eliminar el cliente",
          });
        }
      },
    });
  };

  const handleDeleteRestaurant = (restaurantId, restaurantName) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar el restaurante ${restaurantName}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmState({isOpen: false, title: "", message: "", onConfirm: null});
        try {
          const response = await fetch(`${API_BASE}/api/delete_restaurant/${restaurantId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Error al eliminar restaurante");
          }

          setRestaurantes(restaurantes.filter((r) => r.id !== restaurantId));
          setModalState({
            isOpen: true,
            title: "Éxito",
            message: "Restaurante eliminado correctamente",
          });
        } catch (error) {
          console.error("Error:", error);
          setModalState({
            isOpen: true,
            title: "Error",
            message: "Error al eliminar el restaurante",
          });
        }
      },
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

      <Modal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({isOpen: false, title: "", message: "", onConfirm: null})}
        title={confirmState.title}
        actions={[
          {
            label: "Cancelar",
            onClick: () => setConfirmState({isOpen: false, title: "", message: "", onConfirm: null}),
            className: "cancel",
          },
          {
            label: "Confirmar",
            onClick: confirmState.onConfirm,
            className: "confirm",
          },
        ]}
      >
        <p>{confirmState.message}</p>
      </Modal>

      <div className="admin-container">
        <header className="admin-header">
          <div className="header-content">
            <h1>Panel de Administración</h1>
            <p className="welcome-message">Bienvenido, {adminName}</p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </header>

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "clientes" ? "active" : ""}`}
            onClick={() => handleTabChange("clientes")}
          >
            Clientes ({clientesOriginales.length})
          </button>
          <button
            className={`tab-button ${activeTab === "restaurantes" ? "active" : ""}`}
            onClick={() => handleTabChange("restaurantes")}
          >
            Restaurantes ({restaurantesOriginales.length})
          </button>
        </div>

        <div className="admin-content">
          {activeTab === "clientes" && (
            <div className="clients-section">
              <h2>Gestión de Clientes</h2>
              <input
                type="text"
                placeholder="Buscar por nombre o correo electrónico..."
                className="search-input-admin"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {clientes.length === 0 ? (
                <p className="no-data">No hay clientes registrados</p>
              ) : (
                <div className="clients-grid">
                  {clientes.map((item) => (
                    <div key={item.client.id} className="client-card">
                      <div className="card-header">
                        <h3>
                          {item.client.name} {item.client.surname}
                        </h3>
                        <span className="badge">{item.client.sub_plan}</span>
                      </div>
                      <div className="card-info">
                        <p>
                          <strong>Email:</strong> {item.user?.email || "N/A"}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {item.client.phone_number}
                        </p>
                        <p>
                          <strong>Ciudad:</strong> {item.client.city}
                        </p>
                        <p>
                          <strong>Créditos:</strong> {item.client.available_credits}
                        </p>
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
                          onClick={() =>
                            handleDeleteClient(item.client.id, `${item.client.name} ${item.client.surname}`)
                          }
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
              <input
                type="text"
                placeholder="Buscar por nombre o correo electrónico..."
                className="search-input-admin"
                value={searchTerm}
                onChange={handleSearchChange}
              />
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
                        <p>
                          <strong>Email:</strong> {item.user?.email || "N/A"}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {item.restaurant.phone_number}
                        </p>
                        <p>
                          <strong>Ciudad:</strong> {item.restaurant.city}
                        </p>
                        <p>
                          <strong>Descripción:</strong> {item.restaurant.description.substring(0, 60)}...
                        </p>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn-view-orders"
                          onClick={() => navigate(`/admin/restaurante/${item.restaurant.id}/pedidos`)}
                        >
                          Ver Pedidos
                        </button>
                        <button
                          className="btn-view-orders"
                          onClick={() => navigate(`/admin/restaurante/${item.restaurant.id}/platos`)}
                        >
                          Ver Platos
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
