// ...existing code...
import React, {useEffect, useState} from "react";
import {Link, useParams, useLocation, useNavigate} from "react-router-dom";
import { useRestaurantCache } from "../context/RestaurantCacheContext";
import LoadingScreen from "../components/LoadingScreen";
import "../css/Restaurant_Dishes.css";

const RestaurantDishes = () => {
  const {restaurantId} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(!location.state?.restaurant);
  const [error, setError] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const { getRestaurantsListCache, cacheDishes, getCachedDishes } = useRestaurantCache();

  // Filtros de tipo de plato
  const [filterPlato, setFilterPlato] = useState({
    entrante: false,
    principal: false,
    postre: false,
  });

  // Filtros de alérgenos
  const [filterAlergenos, setFilterAlergenos] = useState({
    gluten: false,
    huevos: false,
    lacteos: false,
    pescado: false,
    soja: false,
    frutosCascara: false,
    cacahuetes: false,
    moluscos: false,
    mostaza: false,
    granosSesamo: false,
    dioxidoAzufre: false,
    crustaceos: false,
  });

  // Búsqueda de platos
  const [searchTerm, setSearchTerm] = useState("");

  // Carrito
  const [cartItems, setCartItems] = useState([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);

  // Rating
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [loadingRating, setLoadingRating] = useState(false);

  const normalizeUrl = (u) => {
    if (!u) return u;
    let url = u.replace(/([^:]\/)\/+/g, "$1");
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("//")) return window.location.protocol + url;
    if (url.startsWith("/")) return API_BASE.replace(/\/$/, "") + url;
    return url;
  };

  //Ahora definimos unos mapeos que nos serán de utilidad a la hora de filtrar
  //lo que mostramos por pantalla

  // Mapeo de tipos de plato
  const dishTypeMapping = {
    entrante: ["entrante", "entrada", "starter", "aperitivo", "appetizer"],
    principal: ["principal", "main", "plato principal", "segundo"],
    postre: ["postre", "dessert", "dulce"],
  };

  // Mapeo de alérgenos
  const allergenMapping = {
    gluten: ["gluten"],
    huevos: ["huevo", "huevos", "egg"],
    lacteos: ["lactosa", "lácteos", "lacteos", "leche", "dairy"],
    pescado: ["pescado", "fish"],
    soja: ["soja", "soy"],
    frutosCascara: ["frutos de cáscara", "frutos secos", "nueces", "nuts"],
    cacahuetes: ["cacahuetes", "cacahuete", "maní", "peanut"],
    moluscos: ["moluscos", "mollusks"],
    mostaza: ["mostaza", "mustard"],
    granosSesamo: ["granos de sésamo", "sésamo", "sesamo", "sesame"],
    dioxidoAzufre: ["dióxido de azufre", "sulfitos", "sulfito", "sulfur dioxide"],
    crustaceos: ["crustáceos", "crustaceos", "marisco", "shellfish"],
  };

  // Función para filtrar platos
  const getFilteredDishes = () => {
    return dishes.filter((dish) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (dish.name || "").toLowerCase().includes(searchLower) ||
        (dish.description || "").toLowerCase().includes(searchLower) ||
        (dish.dish_type || "").toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

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

      if (!dishTypeMatch) return false;

      // Filtro de alérgenos (EVITAR los que están MARCADOS)
      const allergensToAvoid = Object.keys(filterAlergenos).filter((key) => filterAlergenos[key]);

      // Si ningún alérgeno está marcado (no se evita ninguno), mostrar todos
      if (allergensToAvoid.length === 0) return true;

      // Normalizar los alérgenos del plato a un array
      let dishAllergens = [];
      if (dish.allergens) {
        if (Array.isArray(dish.allergens)) {
          dishAllergens = dish.allergens;
        } else if (typeof dish.allergens === "string") {
          // Si es un string, intentar parsearlo o dividirlo
          try {
            dishAllergens = JSON.parse(dish.allergens);
          } catch {
            dishAllergens = dish.allergens.split(",").map((a) => a.trim());
          }
        }
      }

      const hasAvoidedAllergen = allergensToAvoid.some((filterKey) => {
        const allergenVariants = allergenMapping[filterKey] || [];
        return dishAllergens.some((allergen) => {
          const allergenLower = (allergen || "").toString().toLowerCase();
          return allergenVariants.some((variant) => allergenLower.includes(variant.toLowerCase()));
        });
      });

      // Si el plato contiene un alérgeno que queremos evitar, no mostrarlo
      return !hasAvoidedAllergen;
    });
  };

  const filteredDishes = getFilteredDishes();

  useEffect(() => {
    if (!restaurantId) return;

    async function load() {
      setError(null);
      
      try {
        const encodedName = encodeURIComponent(restaurantId);

        // Intentar obtener restaurante del state o caché
        let restaurantData = location.state?.restaurant;
        
        if (!restaurantData) {
          const cachedRestaurants = getRestaurantsListCache();
          if (cachedRestaurants && cachedRestaurants.length > 0) {
            restaurantData = cachedRestaurants.find(r => r.name === restaurantId);
            if (restaurantData) {
              console.log("Using restaurant data from cache:", restaurantData);
              setRestaurant(restaurantData);
            }
          }

          if (!restaurantData) {
            console.log("Fetching restaurant from API:", restaurantId);
            const rRes = await fetch(`${API_BASE}/restaurants/name/${encodedName}`);
            if (!rRes.ok) throw new Error(`Error fetching restaurant: ${rRes.status}`);
            const rJson = await rRes.json();
            console.log("Restaurant from API:", rJson);
            setRestaurant(rJson);
          }
        }

        // Intentar obtener platos del caché
        const cachedDishes = getCachedDishes(restaurantId);
        if (cachedDishes && cachedDishes.length > 0) {
          console.log("Using dishes from cache:", cachedDishes);
          setDishes(cachedDishes);
          setLoading(false);
          return;
        }

        // Si no están en caché, cargar del API
        setLoading(true);
        const dRes = await fetch(`${API_BASE}/restaurants/name/${encodedName}/dishes`);
        if (!dRes.ok) throw new Error(`Error fetching dishes: ${dRes.status}`);
        const dJson = await dRes.json();
        console.log("Dishes from API:", dJson);
        const dishesArray = Array.isArray(dJson) ? dJson : [];
        setDishes(dishesArray);
        // Cachear los platos
        cacheDishes(restaurantId, dishesArray);

        console.log("Dishes loaded successfully");
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [restaurantId, API_BASE, getRestaurantsListCache, cacheDishes, getCachedDishes]);

  // Actualizar carrito cuando restaurant está disponible
  useEffect(() => {
    // Solo ejecutar cuando tenemos el ID del restaurante
    if (!restaurant?.id) return;

    const updateCart = () => {
      const carrito = sessionStorage.getItem("carrito");
      if (carrito) {
        try {
          const carritoObj = JSON.parse(carrito);
          // Si el carrito pertenece a un restaurante DIFERENTE, vaciar
          // Comparar por ID numérico del restaurante
          if (carritoObj.restaurantId && carritoObj.restaurantId !== restaurant.id) {
            console.log(
              "Vaciando carrito: carrito de restaurante",
              carritoObj.restaurantId,
              "pero estamos en",
              restaurant.id
            );
            sessionStorage.removeItem("carrito");
            setCartItems([]);
            window.dispatchEvent(new Event("carritoActualizado"));
            return;
          }
          // Si el carrito es del mismo restaurante, mostrar los platos
          setCartItems(carritoObj.dishes || []);
        } catch (error) {
          console.error("Error parsing cart:", error);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    };

    updateCart();

    // Escuchar cambios en el carrito
    window.addEventListener("carritoActualizado", updateCart);
    return () => window.removeEventListener("carritoActualizado", updateCart);
  }, [restaurant?.id]);

  // Cargar el rating existente del usuario
  useEffect(() => {
    const fetchUserRating = async () => {
      const clientId = sessionStorage.getItem("role_id");
      const role = sessionStorage.getItem("role");
      
      if (!clientId || role !== "Client" || !restaurant?.id) {
        return;
      }

      setLoadingRating(true);
      try {
        const url = `${API_BASE}/api/rating/${clientId}/${restaurant.id}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (data.rating !== null) {
            setUserRating(data.rating);
          }
        }
      } catch (err) {
        console.error("Error cargando rating del usuario:", err);
      } finally {
        setLoadingRating(false);
      }
    };

    fetchUserRating();
  }, [restaurant?.id, API_BASE]);

  const handleRatingClick = async (rating) => {
    const clientId = sessionStorage.getItem("role_id");
    const role = sessionStorage.getItem("role");
    
    if (!clientId || role !== "Client") {
      alert("Debes iniciar sesión como cliente para dejar una valoración");
      return;
    }

    if (!restaurant?.id) {
      alert("Error: No se pudo identificar el restaurante");
      return;
    }

    setIsSubmittingRating(true);
    try {
      const url = `${API_BASE}/api/create_rating/${clientId}/${restaurant.id}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating,
          comment: ""
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status} al enviar la valoración`);
      }

      const result = await response.json();
      console.log("Valoración enviada:", result);
      setUserRating(rating);
      alert(`¡Gracias por tu valoración de ${rating} ${rating === 1 ? 'estrella' : 'estrellas'}!`);
    } catch (err) {
      console.error("Error enviando valoración:", err);
      alert("Error al enviar la valoración. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando platos..." />;
  }

  return (
    <main className="restaurant-page">
      <div className="page-inner">
        {/* Sidebar con filtros */}
        <aside className="sidebar">
          <h3 className="filter-title">Filtros</h3>

          {/* Filtro de Plato */}
          <div className="filter-section">
            <h4 className="filter-subtitle">Tipo de Plato</h4>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterPlato.entrante}
                onChange={(e) => setFilterPlato({...filterPlato, entrante: e.target.checked})}
              />
              Entrante
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterPlato.principal}
                onChange={(e) => setFilterPlato({...filterPlato, principal: e.target.checked})}
              />
              Principal
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterPlato.postre}
                onChange={(e) => setFilterPlato({...filterPlato, postre: e.target.checked})}
              />
              Postre
            </label>
          </div>

          {/* Filtro de Evitar alérgenos */}
          <div className="filter-section">
            <h4 className="filter-subtitle">Evitar alérgenos</h4>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.gluten}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, gluten: e.target.checked})}
              />
              Gluten
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.huevos}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, huevos: e.target.checked})}
              />
              Huevos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.lacteos}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, lacteos: e.target.checked})}
              />
              Lácteos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.pescado}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, pescado: e.target.checked})}
              />
              Pescado
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.soja}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, soja: e.target.checked})}
              />
              Soja
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.frutosCascara}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, frutosCascara: e.target.checked})}
              />
              Frutos de Cáscara
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.cacahuetes}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, cacahuetes: e.target.checked})}
              />
              Cacahuetes
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.moluscos}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, moluscos: e.target.checked})}
              />
              Moluscos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.mostaza}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, mostaza: e.target.checked})}
              />
              Mostaza
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.granosSesamo}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, granosSesamo: e.target.checked})}
              />
              Granos de Sésamo
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.dioxidoAzufre}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, dioxidoAzufre: e.target.checked})}
              />
              Dióxido de Azufre y Sulfitos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.crustaceos}
                onChange={(e) => setFilterAlergenos({...filterAlergenos, crustaceos: e.target.checked})}
              />
              Crustáceos
            </label>
          </div>
        </aside>

        <section className="content">
          {error && <p style={{color: "crimson"}}>Error: {error}</p>}
          <header className="restaurant-header">
            <div className="header-left">
              {restaurant?.image_url ? (
                <img
                  className="header-hero-img"
                  src={normalizeUrl(restaurant.image_url)}
                  alt={`${restaurant.name} image`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
                      restaurant?.name || "R"
                    )}`;
                  }}
                />
              ) : (
                <img
                  className="header-hero-img"
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
                    restaurant?.name || "R"
                  )}`}
                  alt={`${restaurant?.name || "Restaurant"} logo`}
                />
              )}
            </div>
            <div className="header-right">
              <h1 className="title">{restaurant?.name}</h1>
              <div className="header-meta">
                <span className="rating">⭐ {restaurant?.rating > 0 ? restaurant.rating : "-"}</span>
                <span className="location">
                  {restaurant?.address}
                  {restaurant?.city && `, ${restaurant.city}`}
                </span>
              </div>
              <p className="restaurant-description">{restaurant?.description}</p>
            </div>
          </header>

          <div className="controls">
            <input 
              className="search" 
              placeholder="Buscar plato..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dishes-list">
            {loading && <p>Cargando platos...</p>}
            {!loading && dishes.length === 0 && <p>No hay platos para este restaurante.</p>}
            {!loading && dishes.length > 0 && filteredDishes.length === 0 && (
              <p className="no-results">No hay platos que coincidan con los filtros seleccionados.</p>
            )}
            {!loading && filteredDishes.length > 0 &&
              filteredDishes.map((d) => (
                <Link
                  key={d.id}
                  to={`/restaurants/${encodeURIComponent(
                    restaurant?.name || restaurantId
                  )}/order/${encodeURIComponent(d.name || "")}`}
                  state={{dish: d, restaurant: restaurant}}
                  className="card-link"
                >
                  <article className="dish-card">
                    <div
                      className="dish-img"
                      style={{
                        backgroundImage: d.image_url ? `url("${normalizeUrl(d.image_url)}")` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="dish-body">
                      <h3 className="dish-title">{d.name}</h3>
                      <p className="dish-sub">{d.dish_type || d.subtitle || d.description || ""}</p>
                      <div className="dish-footer">
                        <span className="dish-price">
                          {d.price ?? (d.credits ? `${d.credits} ${d.credits === 1 ? 'Yameat' : 'Yameats'}` : "")}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
          </div>
        </section>

        {/* Columna derecha: carrito y rating */}
        <div className="right-column">
          {/* Mini resumen del carrito */}
          <aside className="cart-sidebar">
            <h3 className="cart-title">📋 Tu Pedido</h3>
            {cartItems.length === 0 ? (
              <p className="empty-cart-message">Sin platos seleccionados</p>
            ) : (
              <div className="cart-summary">
                <ul className="cart-items-list">
                  {cartItems.map((item) => (
                    <li key={item.dishId} className="cart-item-mini">
                      <span className="cart-item-name">{item.dishName}</span>
                      <span className="cart-item-price">{item.credits} 🍽️</span>
                    </li>
                  ))}
                </ul>
                <div className="cart-total">
                  <strong>Total: {cartItems.reduce((sum, item) => sum + (item.credits || 0), 0)} 🍽️</strong>
                </div>
                <button 
                  className="btn-checkout"
                  onClick={() => navigate("/carrito")}
                >
                  Ver Carrito →
                </button>
              </div>
            )}
          </aside>

          {/* Rating Section - Debajo del carrito */}
          {sessionStorage.getItem("role") === "Client" && (
            <div className="rating-section-sidebar">
              <div className="rating-card">
                <h3 className="rating-title">Valora este restaurante</h3>
                {loadingRating ? (
                  <p className="rating-loading">Cargando...</p>
                ) : (
                  <>
                    <div className="stars-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`star-button ${star <= (hoverRating || userRating) ? 'active' : ''}`}
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          disabled={isSubmittingRating}
                          title={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    {userRating > 0 && (
                      <p className="rating-message">
                        Tu valoración: {userRating} {userRating === 1 ? 'estrella' : 'estrellas'}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default RestaurantDishes;
