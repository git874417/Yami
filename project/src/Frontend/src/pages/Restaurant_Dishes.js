// ...existing code...
import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import "../css/Restaurant_Dishes.css";

const RestaurantDishes = () => {
  const {restaurantId} = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const normalizeUrl = (u) => {
    if (!u) return u;
    // Fix double slashes in URLs (common Supabase issue)
    let url = u.replace(/([^:]\/)\/+/g, "$1");
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("//")) return window.location.protocol + url;
    if (url.startsWith("/")) return API_BASE.replace(/\/$/, "") + url;
    return url;
  };

  useEffect(() => {
    if (!restaurantId) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Use the restaurantId param to fetch restaurant and its dishes
        const id = encodeURIComponent(restaurantId);
        const [rRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/api/restaurant/${id}`),
          fetch(`${API_BASE}/api/dishes/${id}`),
        ]);

        if (!rRes.ok) throw new Error(`Error fetching restaurant: ${rRes.status}`);
        if (!dRes.ok) throw new Error(`Error fetching dishes: ${dRes.status}`);

        const rJson = await rRes.json();
        const dJson = await dRes.json();

        setRestaurant(rJson);
        // Handle both array response and { dishes: [...] } object response
        const dishesArray = Array.isArray(dJson) ? dJson : dJson.dishes || [];
        setDishes(dishesArray);

        console.log("Restaurant:", rJson);
        console.log("Dishes:", dishesArray);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [restaurantId]);

  return (
    <main className="restaurant-page">
      <div className="page-inner">
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
                <span className="rating">★ {restaurant?.rating ?? "-"}</span>
                <span className="location">{restaurant?.address}</span>
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
            {dishes.length > 0 &&
              dishes.map((d) => (
                <Link
                  key={d.id}
                  to={`/restaurants/${encodeURIComponent(
                    restaurant?.id || restaurantId
                  )}/order/${encodeURIComponent(d.name || "")}`}
                  state={{dishId: d.id}}
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
// ...existing code...
