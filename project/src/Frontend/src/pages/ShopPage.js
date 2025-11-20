import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantCache } from "../context/RestaurantCacheContext";
import LoadingScreen from "../components/LoadingScreen";
import "../css/ShopPage.css";

const ShopPage = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByRating, setSortByRating] = useState(false);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const { getRestaurantsListCache, setRestaurantsListCache } = useRestaurantCache();

  // Filtros de tipo de comida
  const [filterTipoComida, setFilterTipoComida] = useState({
    mexicano: false,
    asiatico: false,
    italiano: false,
    fast_food: false,
    asador: false,
    griego: false,
    indio: false,
  });

  const fetchRestaurantes = async () => {
    // Verificar si tenemos datos en caché
    const cachedRestaurants = getRestaurantsListCache();
    if (cachedRestaurants && cachedRestaurants.length > 0) {
      setRestaurantes(cachedRestaurants);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/restaurants`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const restaurants = data.restaurants || [];
      setRestaurantes(restaurants);
      // Cachear la lista de restaurantes
      setRestaurantsListCache(restaurants);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantes();
  }, []);

  const handleRestaurantClick = (restaurant) => {
    navigate(`/restaurants/${encodeURIComponent(restaurant.name)}`, {
      state: { restaurant }
    });
  };

  const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return window.location.protocol + url;
    if (url.startsWith('/')) return API_BASE.replace(/\/$/, '') + url;
    return url;
  };

  // Mapeo de categorías del filtro a las categorías de la base de datos
  const categoryMapping = {
    mexicano: ['Mexicano', 'Mexican'],
    asiatico: ['Asiático', 'Asiatico', 'Asian', 'Chino', 'Japonés', 'Japonesa', 'Tailandés'],
    italiano: ['Italiano', 'Italian', 'Pizza', 'Pasta'],
    fast_food: ['Fast Food', 'FastFood', 'Hamburguesería', 'Hamburguesas'],
    asador: ['Asador', 'Carne', 'Parrilla', 'Steakhouse'],
    griego: ['Griego', 'Greek'],
    indio: ['Indio', 'Indian', 'Hindú']
  };

  // Función para filtrar restaurantes
  const getFilteredRestaurants = () => {
    let filtered = restaurantes.filter(restaurant => {
      // Filtro de búsqueda por nombre
      const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) {
        return false;
      }
      
      // Obtenemos las categorías marcadas 
      const activeCategories = Object.keys(filterTipoComida).filter(key => filterTipoComida[key]);
      
      // Si ninguna categoría está activa, mostramos todos
      if (activeCategories.length === 0) {
        return true;
      }
      
      // Verificamos si la categoría de los restaurantes coincide con las marcadas
      const restaurantCategory = restaurant.category?.toLowerCase() || '';
      
      return activeCategories.some(filterKey => {
        const categoryVariants = categoryMapping[filterKey] || [];
        return categoryVariants.some(variant => 
          restaurantCategory.includes(variant.toLowerCase())
        );
      });
    });

    // Ordenar por valoración si está activado
    if (sortByRating) {
      filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  if (loading) {
    return <LoadingScreen message="Cargando restaurantes..." />;
  }

  return (
    <main className="shop-page">
      <div className="shop-container">
        <header className="shop-header">
          <h1>Todos los restaurantes</h1>
          <p className="shop-subtitle">Aquí encontrarás todos los restaurantes disponibles</p>
        </header>

        <div className="shop-content">
          {/* Sidebar con filtros */}
          <aside className="shop-sidebar">
            <h3 className="filter-title">Filtros</h3>

            {/* Filtro de Tipo de comida */}
            <div className="filter-section">
              <h4 className="filter-subtitle">Tipo de comida</h4>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterTipoComida.mexicano}
                  onChange={(e) => setFilterTipoComida({ ...filterTipoComida, mexicano: e.target.checked })}
                />
                Mexicano
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterTipoComida.asiatico}
                  onChange={(e) => setFilterTipoComida({ ...filterTipoComida, asiatico: e.target.checked })}
                />
                Asiático
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterTipoComida.italiano}
                  onChange={(e) => setFilterTipoComida({ ...filterTipoComida, italiano: e.target.checked })}
                />
                Italiano
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterTipoComida.fast_food}
                  onChange={(e) => setFilterTipoComida({ ...filterTipoComida, fast_food: e.target.checked })}
                />
                Fast Food
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterTipoComida.asador}
                  onChange={(e) => setFilterTipoComida({ ...filterTipoComida, asador: e.target.checked })}
                />
                Asador
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterTipoComida.griego}
                  onChange={(e) => setFilterTipoComida({ ...filterTipoComida, griego: e.target.checked })}
                />
                Griego
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterTipoComida.indio}
                  onChange={(e) => setFilterTipoComida({ ...filterTipoComida, indio: e.target.checked })}
                />
                Indio
              </label>
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
                className={`sort-button rating-button ${sortByRating ? 'active' : ''}`}
                onClick={() => setSortByRating(!sortByRating)}
              >
                ⭐ Mejor Valoración
              </button>
            </div>

            {/* Mensajes de estado */}
            {loading && <p className="status-message">Cargando restaurantes...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {/* Grid de restaurantes */}
            <div className="restaurants-grid">
              {filteredRestaurants.length === 0 && !loading ? (
                <p className="no-results">No se encontraron restaurantes con los filtros seleccionados</p>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="restaurant-card"
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <div className="restaurant-image">
                      {restaurant.image_url ? (
                        <img
                          src={normalizeUrl(restaurant.image_url)}
                          alt={restaurant.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant.name)}`;
                          }}
                        />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant.name)}`}
                          alt={restaurant.name}
                        />
                      )}
                    </div>
                    <div className="restaurant-info">
                      <div className="restaurant-rating">
                        <span className="star">⭐</span>
                        <span className="rating-value">{restaurant.rating > 0 ? restaurant.rating : "-"}</span>
                      </div>
                      <p className="restaurant-label">Restaurante</p>
                      <h3 className="restaurant-name">{restaurant.name}</h3>
                      <p className="restaurant-category">{restaurant.category || "Tipo de Comida"}</p>
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

export default ShopPage;
