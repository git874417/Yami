import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/AdminOrders.css";

const AdminRestaurantDishes = () => {
  const { restaurantId } = useParams();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "" });
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchDishes();
  }, [restaurantId]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/dishes/${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Dishes data:", data);
        setDishes(data.dishes || []);
      } else {
        setModalState({
          isOpen: true,
          title: "Error",
          message: "Error al cargar los platos"
        });
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error al cargar los platos"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = (dishId, dishName) => {
    setConfirmState({
      isOpen: true,
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar el plato "${dishName}"?`,
      onConfirm: () => confirmDeleteDish(dishId)
    });
  };

  const confirmDeleteDish = async (dishId) => {
    try {
      const response = await fetch(`${API_BASE}/api/delete_dish/${dishId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setDishes(dishes.filter(dish => dish.id !== dishId));
        setModalState({
          isOpen: true,
          title: "Éxito",
          message: "Plato eliminado correctamente"
        });
      } else {
        setModalState({
          isOpen: true,
          title: "Error",
          message: "Error al eliminar el plato"
        });
      }
    } catch (error) {
      console.error("Error deleting dish:", error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Error al eliminar el plato"
      });
    }
    setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  return (
    <div className="admin-orders-container">
      {/* Modal de mensaje */}
      {modalState.isOpen && (
        <div className="modal-backdrop" onClick={() => setModalState({ isOpen: false, title: "", message: "" })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modalState.title}</h2>
              <button className="modal-close-button" onClick={() => setModalState({ isOpen: false, title: "", message: "" })}>
                &times;
              </button>
            </div>
            <div className="modal-body">{modalState.message}</div>
            <div className="modal-footer">
              <button 
                className="modal-action-button" 
                onClick={() => setModalState({ isOpen: false, title: "", message: "" })}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmState.isOpen && (
        <div className="modal-backdrop" onClick={() => setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{confirmState.title}</h2>
              <button className="modal-close-button" onClick={() => setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null })}>
                &times;
              </button>
            </div>
            <div className="modal-body">{confirmState.message}</div>
            <div className="modal-footer">
              <button 
                className="modal-action-button secondary"
                onClick={() => setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null })}
              >
                Cancelar
              </button>
              <button 
                className="modal-action-button danger"
                onClick={confirmState.onConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="orders-header">
        <button className="btn-back" onClick={() => navigate("/admin")}>
          ← Volver al Panel
        </button>
        <h1>Platos del Restaurante</h1>
      </div>

      {loading ? (
        <div className="loading">Cargando platos...</div>
      ) : dishes.length === 0 ? (
        <div className="no-data">No hay platos registrados para este restaurante</div>
      ) : (
        <div className="dishes-list">
          {dishes.map((dish) => (
            <div key={dish.id} className="dish-card">
              <div className="dish-image-container">
                {dish.image_url ? (
                  <img src={dish.image_url} alt={dish.name} className="dish-image" />
                ) : (
                  <div className="dish-image-placeholder">Sin imagen</div>
                )}
              </div>
              <div className="dish-right-section">
                <div className="dish-top-section">
                  <div className="dish-info">
                    <h3>{dish.name}</h3>
                    <p className="dish-type">{dish.dish_type}</p>
                  </div>
                  <div className="dish-details">
                    <p>{dish.description}</p>
                    <p className="allergens"><strong>Alérgenos:</strong> {dish.allergens || "Ninguno"}</p>
                  </div>
                </div>
                <div className="dish-bottom-section">
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteDish(dish.id, dish.name)}
                  >
                    Eliminar Plato
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRestaurantDishes;
