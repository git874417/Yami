// ...existing code...
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../css/Restaurant_Dishes.css";

const RestaurantDishes = () => {
  const { id: restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const normalizeUrl = (u) => {
    if (!u) return u;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (u.startsWith('//')) return window.location.protocol + u;
    if (u.startsWith('/')) return API_BASE.replace(/\/$/, '') + u;
    return u;
  };

  useEffect(() => {
    if (!restaurantId) return;

    const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/api/restaurant/${restaurantId}`),
          fetch(`${API_BASE}/api/dishes/${restaurantId}`),
        ]);

        if (!rRes.ok) throw new Error(`Error fetching restaurant: ${rRes.status}`);
        if (!dRes.ok) throw new Error(`Error fetching dishes: ${dRes.status}`);

        const rJson = await rRes.json();
        const dJson = await dRes.json();

        // backend returns { ... } for restaurant and { dishes: [...] } for dishes
        setRestaurant(rJson);
        setDishes(dJson.dishes || []);
      } catch (err) {
        console.error(err);
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
        <aside className="sidebar">
          <div className="restaurant-card">
            {restaurant?.image_url ? (
                <img
                  className="header-hero-img"
                  src={normalizeUrl(restaurant.image_url)}
                  alt={`${restaurant.name} image`}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/220x140?text=No+image'; }}
                />
              ) : (
                <div className="hero-image-placeholder" />
            )}
            <h3 className="restaurant-name">{restaurant?.name || "Restaurante"}</h3>
            <div className="meta">
              <span className="rating">★ {restaurant?.rating ?? "-"}</span>
              <span className="reviews">{restaurant?.reviews ?? 0} reseñas</span>
            </div>
            <h4 className="about-title">Acerca de</h4>
            <p className="about-text">{restaurant?.description}</p>
          </div>
        </aside>

        <section className="content">
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
          <header className="restaurant-header">
            <div className="header-left">
              {restaurant?.image_url ? (
                <img
                  className="header-hero-img"
                  src={normalizeUrl(restaurant.image_url)}
                  alt={`${restaurant.name} image`}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/220x140?text=No+image'; }}
                />
              ) : (
                <div className="hero-image-placeholder" />
              )}
            </div>
            <div className="header-right">
              <h1 className="title">{restaurant?.name}</h1>
              <div className="header-meta">
                <span className="rating-big">★ {restaurant?.rating}</span>
                <span className="location">{restaurant?.address}</span>
              </div>
              <div className="header-actions">
                <Link to="/reservar" className="btn btn-primary">Reservar</Link>
                <Link to="/contacto" className="btn btn-ghost">Contacto</Link>
              </div>
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
            {dishes.map(d => (
              <Link key={d.id} to={`/order/${d.id}`} className="card-link">
                <article className="dish-card">
                  <div className="dish-img" style={{ backgroundImage: d.image_url ? `url(${d.image_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="dish-body">
                    <h3 className="dish-title">{d.name}</h3>
                    <p className="dish-sub">{d.dish_type || d.subtitle || d.description || ''}</p>
                    <div className="dish-footer">
                      <span className="dish-price">{d.price ?? (d.credits ? `${d.credits} créditos` : '')}</span>
                      <span className="dish-rating">★ {d.rating ?? '-'}</span>
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