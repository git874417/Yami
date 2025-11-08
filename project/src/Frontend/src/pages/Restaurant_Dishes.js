// ...existing code...
import React, {useEffect, useState} from "react";
import {Link, useParams, useLocation} from "react-router-dom";
import "../css/Restaurant_Dishes.css";

const RestaurantDishes = () => {
  const {restaurantId} = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(!location.state?.restaurant);
  const [error, setError] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

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
    entrante: ['entrante', 'entrada', 'starter', 'aperitivo', 'appetizer'],
    principal: ['principal', 'main', 'plato principal', 'segundo'],
    postre: ['postre', 'dessert', 'dulce']
  };

  // Mapeo de alérgenos
  const allergenMapping = {
    gluten: ['gluten'],
    huevos: ['huevo', 'huevos', 'egg'],
    lacteos: ['lactosa', 'lácteos', 'lacteos', 'leche', 'dairy'],
    pescado: ['pescado', 'fish'],
    soja: ['soja', 'soy'],
    frutosCascara: ['frutos de cáscara', 'frutos secos', 'nueces', 'nuts'],
    cacahuetes: ['cacahuetes', 'cacahuete', 'maní', 'peanut'],
    moluscos: ['moluscos', 'mollusks'],
    mostaza: ['mostaza', 'mustard'],
    granosSesamo: ['granos de sésamo', 'sésamo', 'sesamo', 'sesame'],
    dioxidoAzufre: ['dióxido de azufre', 'sulfitos', 'sulfito', 'sulfur dioxide'],
    crustaceos: ['crustáceos', 'crustaceos', 'marisco', 'shellfish']
  };

  // Función para filtrar platos
  const getFilteredDishes = () => {
    return dishes.filter(dish => {
      // Filtro de tipo de plato
      const activeDishTypes = Object.keys(filterPlato).filter(key => filterPlato[key]);
      
      // Si ninguno está activo, no filtrar por tipo (mostrar todos)
      const dishTypeMatch = activeDishTypes.length === 0 ||
                           activeDishTypes.some(filterKey => {
                             const typeVariants = dishTypeMapping[filterKey] || [];
                             const dishType = (dish.dish_type || '').toLowerCase();
                             return typeVariants.some(variant => dishType.includes(variant.toLowerCase()));
                           });

      if (!dishTypeMatch) return false;

      // Filtro de alérgenos (EVITAR los que están MARCADOS)
      const allergensToAvoid = Object.keys(filterAlergenos).filter(key => filterAlergenos[key]);
      
      // Si ningún alérgeno está marcado (no se evita ninguno), mostrar todos
      if (allergensToAvoid.length === 0) return true;

      // Normalizar los alérgenos del plato a un array
      let dishAllergens = [];
      if (dish.allergens) {
        if (Array.isArray(dish.allergens)) {
          dishAllergens = dish.allergens;
        } else if (typeof dish.allergens === 'string') {
          // Si es un string, intentar parsearlo o dividirlo
          try {
            dishAllergens = JSON.parse(dish.allergens);
          } catch {
            dishAllergens = dish.allergens.split(',').map(a => a.trim());
          }
        }
      }
      
      const hasAvoidedAllergen = allergensToAvoid.some(filterKey => {
        const allergenVariants = allergenMapping[filterKey] || [];
        return dishAllergens.some(allergen => {
          const allergenLower = (allergen || '').toString().toLowerCase();
          return allergenVariants.some(variant => allergenLower.includes(variant.toLowerCase()));
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
      setLoading(true);
      try {
        const encodedName = encodeURIComponent(restaurantId);
        
        // Si ya tenemos los datos del restaurante del state, solo cargamos los platos
        if (location.state?.restaurant) {
          console.log("Using restaurant data from state:", location.state.restaurant);
          const dRes = await fetch(`${API_BASE}/restaurants/name/${encodedName}/dishes`);
          if (!dRes.ok) throw new Error(`Error fetching dishes: ${dRes.status}`);
          const dJson = await dRes.json();
          console.log("Dishes from API:", dJson);
          setDishes(Array.isArray(dJson) ? dJson : []);
        } else {
          // Si no tenemos los datos, cargamos todo usando el endpoint por nombre
          console.log("Fetching all data for restaurant:", restaurantId);
          const [rRes, dRes] = await Promise.all([
            fetch(`${API_BASE}/restaurants/name/${encodedName}`),
            fetch(`${API_BASE}/restaurants/name/${encodedName}/dishes`),
          ]);

          if (!rRes.ok) throw new Error(`Error fetching restaurant: ${rRes.status}`);
          if (!dRes.ok) throw new Error(`Error fetching dishes: ${dRes.status}`);

          const rJson = await rRes.json();
          const dJson = await dRes.json();

          console.log("Restaurant from API:", rJson);
          console.log("Dishes from API:", dJson);

          setRestaurant(rJson);
          setDishes(Array.isArray(dJson) ? dJson : []);
        }

        console.log("Dishes loaded successfully");
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [restaurantId, API_BASE]);

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
                onChange={(e) => setFilterPlato({ ...filterPlato, entrante: e.target.checked })}
              />
              Entrante
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterPlato.principal}
                onChange={(e) => setFilterPlato({ ...filterPlato, principal: e.target.checked })}
              />
              Principal
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterPlato.postre}
                onChange={(e) => setFilterPlato({ ...filterPlato, postre: e.target.checked })}
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
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, gluten: e.target.checked })}
              />
              Gluten
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.huevos}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, huevos: e.target.checked })}
              />
              Huevos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.lacteos}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, lacteos: e.target.checked })}
              />
              Lácteos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.pescado}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, pescado: e.target.checked })}
              />
              Pescado
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.soja}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, soja: e.target.checked })}
              />
              Soja
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.frutosCascara}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, frutosCascara: e.target.checked })}
              />
              Frutos de Cáscara
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.cacahuetes}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, cacahuetes: e.target.checked })}
              />
              Cacahuetes
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.moluscos}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, moluscos: e.target.checked })}
              />
              Moluscos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.mostaza}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, mostaza: e.target.checked })}
              />
              Mostaza
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.granosSesamo}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, granosSesamo: e.target.checked })}
              />
              Granos de Sésamo
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.dioxidoAzufre}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, dioxidoAzufre: e.target.checked })}
              />
              Dióxido de Azufre y Sulfitos
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterAlergenos.crustaceos}
                onChange={(e) => setFilterAlergenos({ ...filterAlergenos, crustaceos: e.target.checked })}
              />
              Crustáceos
            </label>
          </div>
        </aside>

        <section className="content">
          {loading && <p>Loading...</p>}
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
                <span className="rating">⭐ {restaurant?.rating ?? "-"}</span>
                <span className="location">
                  {restaurant?.address}
                  {restaurant?.city && `, ${restaurant.city}`}
                </span>
              </div>
              <p className="restaurant-description">{restaurant?.description}</p>
            </div>
          </header>

          <div className="controls">
            <input className="search" placeholder="Buscar plato..." />
            <select className="filter">
              <option>Todos</option>
              <option>Entrantes</option>
              <option>Platos principales</option>
              <option>Postres</option>
            </select>
            <button className="btn btn-outline">Ordenar</button>
          </div>

          <div className="dishes-list">
            {dishes.length === 0 && !loading && <p>No hay platos para este restaurante.</p>}
            {dishes.length > 0 && filteredDishes.length === 0 && !loading && (
              <p className="no-results">No hay platos que coincidan con los filtros seleccionados.</p>
            )}
            {filteredDishes.length > 0 &&
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
                          {d.price ?? (d.credits ? `${d.credits} créditos` : "")}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default RestaurantDishes;
