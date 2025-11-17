import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
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
          throw new Error("Failed to fetch restaurants");
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
          <Link to="/registerClient" className="btn-primary">
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
          <h2>Unete a Yami!</h2>
          <div className="card-grid">
            <Link to="/registerClient" className="card-link">
              <article className="card">
                <img
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60"
                  alt="Burger"
                />
                <h3>Únete a Yami</h3>
                <p>Elige uno de nuestros planes y empieza a disfrutar.</p>
              </article>
            </Link>

            <Link to="/registerRestaurant" className="card-link">
              <article className="card">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60"
                  alt="Vende"
                />
                <h3>Vende con Yami</h3>
                <p>Ofrece tus servicios a través de Yami.</p>
              </article>
            </Link>

            <Link to="/registro" className="card-link"> 
              <article className="card">
                <div className="placeholder-box" />
                <h3>Reparte con Yami</h3>
                <p>Únete a nuestro equipo de repartidores.</p>
              </article>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
