import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${API_BASE}/restaurants`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        setRestaurants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-content">
          <h1>¡Bienvenido a Yami!</h1>
          <p className="hero-sub">Yami es tu nuevo servicio de comida a domicilio.</p>
        </div>
        <div className="hero-actions">
          <Link to="/registro" className="btn-primary">
            ¡Forma parte de Yami!
          </Link>
        </div>
      </div>
      
      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60"
          alt="Comida"
        />
      </div>

      <div className="cards">
        <div className="cards-inner">
          <h2>Nuestros Restaurantes</h2>
          {loading && <p>Cargando restaurantes...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          <div className="card-grid">
            {restaurants.map(restaurant => (
              <Link key={restaurant.id} to={`/restaurants/${restaurant.name}`} className="card-link">
                <article className="card">
                  <div className="card-image">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant.name)}`;
                        }}
                      />
                    ) : (
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(restaurant.name)}`}
                        alt={restaurant.name}
                      />
                    )}
                  </div>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.description || 'Descubre nuestros platos'}</p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
