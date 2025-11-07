// ...existing code...
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../css/Restaurant_Dishes.css";

const RestaurantDishes = () => {
  const { restaurantName } = useParams();
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
    if (!restaurantName) return;

    const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Use encodeURIComponent to handle special characters in the restaurant name
        const encodedName = encodeURIComponent(restaurantName);
        const [rRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants/name/${encodedName}`),
          fetch(`${API_BASE}/restaurants/name/${encodedName}/dishes`),
        ]);

        if (!rRes.ok) throw new Error(`Error fetching restaurant: ${rRes.status}`);
        if (!dRes.ok) throw new Error(`Error fetching dishes: ${dRes.status}`);

        const rJson = await rRes.json();
        const dJson = await dRes.json();

        setRestaurant(rJson);
        setDishes(Array.isArray(dJson) ? dJson : []);

        console.log('Restaurant:', rJson);
        console.log('Dishes:', dJson);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [restaurantName]);

  return (
    <main className="restaurant-page">
      <div className="page-inner">
        <section className="content">
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
          <header className="restaurant-header">
            <div className="header-left">
            {restaurant?.logo_url ? (
                <img
                  className="header-hero-img"
                  src={normalizeUrl(restaurant.logo_url)}
                  alt={`${restaurant.name} image`}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant?.name || 'R')}` }}
                />
              ) : (
                <img
                  className="header-hero-img"
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant?.name || 'R')}`}
                  alt={`${restaurant?.name || 'Restaurant'} logo`}
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
            {dishes.map(d => (
              <Link 
                key={d.id} 
                to={`/restaurants/${restaurant?.name}/order/${d.name}`} 
                state={{ dish: d }}
                className="card-link"
              >
                <article className="dish-card">
                  <div className="dish-img" style={{ backgroundImage: d.image_url ? `url(${d.image_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="dish-body">
                    <h3 className="dish-title">{d.name}</h3>
                    <p className="dish-sub">{d.dish_type || d.subtitle || d.description || ''}</p>
                    <div className="dish-footer">
                      <span className="dish-price">{d.price ?? (d.credits ? `${d.credits} créditos` : '')}</span>
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