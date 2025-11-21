import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { useRestaurantCache } from "../context/RestaurantCacheContext";
import LoadingScreen from "../components/LoadingScreen";
import "../css/RestaurantMain.css";

const RestaurantMain = () => {
  const { restaurantId } = useParams();
  const { showModal, hideModal } = useModal();
  const { getRestaurantData, setRestaurantData } = useRestaurantCache();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  // Filtros de tipo de plato
  const [filterPlato, setFilterPlato] = useState({
    entrante: false,
    principal: false,
    postre: false,
    bebida: false,
  });

  const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return window.location.protocol + url;
    if (url.startsWith('/')) return API_BASE.replace(/\/$/, '') + url;
    return url;
  };

  // Mapeo de tipos de plato
  const dishTypeMapping = {
    entrante: ["entrante", "entrada", "starter", "aperitivo", "appetizer"],
    principal: ["principal", "main", "plato principal", "segundo"],
    postre: ["postre", "dessert", "dulce"],
    bebida: ["bebida", "drink", "beverage", "refresco", "drink"]
  };

  // Función para filtrar platos
  const getFilteredDishes = () => {
    // Copia de la lista
    let results = Array.isArray(dishes) ? [...dishes] : [];

    // 1) Filtrar por tipo si hay filtros activos
    const activeDishTypes = Object.keys(filterPlato).filter((key) => filterPlato[key]);
    if (activeDishTypes.length > 0) {
      results = results.filter((dish) => {
        const dishType = (dish.dish_type || "").toLowerCase();
        return activeDishTypes.some((filterKey) => {
          const typeVariants = dishTypeMapping[filterKey] || [];
          return typeVariants.some((variant) => dishType.includes(variant.toLowerCase()));
        });
      });
    }

    // 2) Filtrar por término de búsqueda
    if (searchTerm && searchTerm.trim() !== "") {
      const q = searchTerm.trim().toLowerCase();
      results = results.filter((dish) => {
        return (
          (dish.name || "").toLowerCase().includes(q) ||
          (dish.description || "").toLowerCase().includes(q) ||
          (dish.dish_type || "").toLowerCase().includes(q)
        );
      });
    }

    // 3) Ordenar según la opción seleccionada
    if (sortOption === "rating_desc") {
      results.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortOption === "rating_asc") {
      results.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0));
    }

    return results;
  };

  const filteredDishes = getFilteredDishes();

  const handleEditDish = (dish) => {
    // Navegar a la página de edición
    navigate(`/restaurantPage/${encodeURIComponent(restaurantId)}/${encodeURIComponent(dish.name)}`, {
      state: { dish, restaurant }
    });
  };

  const handleDeleteDish = (dishId) => {
    const performDelete = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/delete_dish/${dishId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Error al eliminar el plato');
        }

        hideModal();
        showModal('Éxito', 'El plato ha sido eliminado correctamente.');
        setDishes(dishes.filter(d => d.id !== dishId));
      } catch (error) {
        console.error('Error deleting dish:', error);
        hideModal();
        showModal('Error', error.message || 'Error al eliminar el plato');
      }
    };

    showModal(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este plato? Esta acción no se puede deshacer.',
      [
        {
          label: 'Cancelar',
          onClick: hideModal,
          className: 'secondary'
        },
        {
          label: 'Eliminar',
          onClick: performDelete,
          className: 'danger'
        }
      ]
    );
  };

  const handleAddDish = () => {
    navigate(`/restaurantPage/${encodeURIComponent(restaurantId)}/createDish`, {
      state: { restaurant }
    });
  };

  // Toggle type filter (entrante/principal/postre/bebida)
  const handleToggleFilter = (type) => {
    setFilterPlato((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Toggle sort by rating (desc). Re-click to disable.
  const handleSortByRating = () => {
    setSortOption((prev) => (prev === "rating_desc" ? "newest" : "rating_desc"));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;
      
      // Intentar obtener datos del caché
      const cachedData = getRestaurantData(restaurantId);
      if (cachedData.restaurant && cachedData.dishes) {
        setRestaurant(cachedData.restaurant);
        setDishes(Array.isArray(cachedData.dishes) ? cachedData.dishes : []);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const encodedName = encodeURIComponent(restaurantId);
        
        const [restaurantRes, dishesRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants/name/${encodedName}`),
          fetch(`${API_BASE}/restaurants/name/${encodedName}/dishes`)
        ]);

        if (!restaurantRes.ok || !dishesRes.ok) {
          throw new Error('Error al cargar datos');
        }

        const restaurantData = await restaurantRes.json();
        const dishesData = await dishesRes.json();

        setRestaurant(restaurantData);
        setDishes(Array.isArray(dishesData) ? dishesData : []);
        
        // Guardar en caché
        setRestaurantData(restaurantId, restaurantData, dishesData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, API_BASE, getRestaurantData, setRestaurantData]);

  if (loading) {
    return <LoadingScreen message="Cargando datos del restaurante..." />;
  }

  return (
    <main className="shop-page">
      <div className="shop-container">
        <header className="shop-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {restaurant?.image_url ? (
              <img
                src={normalizeUrl(restaurant.image_url)}
                alt={restaurant.name}
                style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant?.name || "R")}`;
                  }}
                />
            ) : (
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant?.name || "R")}`}
                alt={restaurant?.name || "Restaurant"}
                style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
              />
            )}
            <div>
              <h1>{restaurant?.name || "Nombre Restaurante"}</h1>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '0.95rem', color: '#666' }}>
                <span>⭐ {restaurant?.rating ?? "5"}</span>
                <span>Tipo {restaurant?.category || "Restaurante"}</span>
                <span>📍 {restaurant?.address || "Ubicacion"}</span>
              </div>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
                {restaurant?.phone_number || "Número de teléfono"}
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button 
                  onClick={() => navigate(`/restaurantPage/${encodeURIComponent(restaurantId)}/edit`)}
                  style={{
                    padding: '8px 16px',
                    background: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Modificar Datos
                </button>
                <button 
                  onClick={handleAddDish}
                  style={{
                    padding: '8px 16px',
                    background: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Añadir Plato
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="shop-content">
          {/* Sidebar con filtros */}
          <aside className="shop-sidebar">
            <h3 className="filter-title">Acerca de</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
              {restaurant?.description || "Descripción"}
            </p>
            
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
              <button
                onClick={() => navigate(`/restaurantPage/${encodeURIComponent(restaurantId)}/orders`)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1a1a1a';
                }}
              >
                📋 Pedidos
              </button>
            </div>
          </aside>

          {/* Contenido principal */}
          <section className="shop-main">
            {/* Barra de búsqueda y ordenar */}
            <div className="shop-controls">
              <div className="search-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-button">🔍</button>
              </div>

              <button 
                className={`sort-button rating-button ${sortOption === "rating_desc" ? "active" : ""}`}
                onClick={handleSortByRating}
              >
                Mayor Valoración
              </button>
              <button 
                className={`sort-button ${filterPlato.entrante ? "active" : ""}`}
                onClick={() => handleToggleFilter("entrante")}
              >
                Entrante
              </button>
              <button 
                className={`sort-button ${filterPlato.principal ? "active" : ""}`}
                onClick={() => handleToggleFilter("principal")}
              >
                Principal
              </button>
              <button 
                className={`sort-button ${filterPlato.postre ? "active" : ""}`}
                onClick={() => handleToggleFilter("postre")}
              >
                Postre
              </button>
              <button 
                className={`sort-button ${filterPlato.bebida ? "active" : ""}`}
                onClick={() => handleToggleFilter("bebida")}
              >
                Bebida
              </button>
            </div>

            {/* Mensajes de estado */}
            {loading && <p className="status-message">Cargando platos...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {/* Grid de platos */}
            <div className="restaurants-grid">
              {filteredDishes.length === 0 && !loading ? (
                <p className="no-results">No se encontraron platos</p>
              ) : (
                filteredDishes.map((dish) => (
                  <div 
                    key={dish.id} 
                    className="restaurant-card"
                    onClick={() => handleEditDish(dish)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="restaurant-image">
                      {dish.image_url ? (
                        <img
                          src={normalizeUrl(dish.image_url)}
                          alt={dish.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(dish.name)}`;
                          }}
                        />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(dish.name)}`}
                          alt={dish.name}
                        />
                      )}
                    </div>
                    <div className="restaurant-info">
                      <h3 className="restaurant-name">{dish.name}</h3>
                      <p className="restaurant-category">{dish.dish_type || "Tipo de plato"}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDish(dish);
                          }}
                          className="button-edit"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDish(dish.id);
                          }}
                          className="button-delete"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RestaurantMain;
