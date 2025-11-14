import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/ShopPage.css";

const RestaurantMain = () => {
  const { restaurantId } = useParams();
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
  };

  // Función para filtrar platos
  const getFilteredDishes = () => {
    return dishes.filter((dish) => {
      // Filtro de tipo de plato
      const activeDishTypes = Object.keys(filterPlato).filter((key) => filterPlato[key]);

      // Si ninguno está activo, no filtrar por tipo (mostrar todos)
      const dishTypeMatch =
        activeDishTypes.length === 0 ||
        activeDishTypes.some((filterKey) => {
          const typeVariants = dishTypeMapping[filterKey] || [];
          const dishType = (dish.dish_type || "").toLowerCase();
          return typeVariants.some((variant) => dishType.includes(variant.toLowerCase()));
        });

      return dishTypeMatch;
    });
  };

  const filteredDishes = getFilteredDishes();

  const handleEditDish = (dish) => {
    // Navegar a la página de edición
    navigate(`/restaurantPage/${encodeURIComponent(restaurantId)}/${encodeURIComponent(dish.name)}`, {
      state: { dish, restaurant }
    });
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este plato?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/dishes/${dishId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el plato');
      }

      // Recargar los platos después de eliminar
      setDishes(dishes.filter(d => d.id !== dishId));
      alert('Plato eliminado correctamente');
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Error al eliminar el plato');
    }
  };

  const handleAddDish = () => {
    navigate(`/restaurantPage/${encodeURIComponent(restaurantId)}/createDish`, {
      state: { restaurant }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;
      
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
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, API_BASE]);

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
                {restaurant?.phone || "Número de teléfono"}
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button 
                  onClick={() => navigate(`/restaurant/${restaurantId}/edit`)}
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

              <button className="sort-button active">✓ Nuevo</button>
              <button className="sort-button">Precio ascendente</button>
              <button className="sort-button">Precio descendente</button>
              <button className="sort-button rating-button">⭐ Valoración</button>
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
                  <div key={dish.id} className="restaurant-card">
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
                      <div className="restaurant-rating">
                        <span className="star">⭐</span>
                        <span className="rating-value">{dish.rating || "5"}</span>
                      </div>
                      <p className="restaurant-label">{dish.dish_type || "Nombre del plato"}</p>
                      <h3 className="restaurant-name">{dish.name}</h3>
                      <p className="restaurant-category">{dish.dish_type || "Tipo de plato"}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          onClick={() => handleEditDish(dish)}
                          style={{
                            padding: '6px 12px',
                            background: '#ff6b35',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'transparent',
                            color: '#333',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          🗑️
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
