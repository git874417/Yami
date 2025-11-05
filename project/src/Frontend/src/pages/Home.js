import React from "react";
import {Link} from "react-router-dom";
import "../css/Home.css";

const Home = () => {
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
          <h2>Unete a Yami!</h2>
          <div className="card-grid">
            <Link to="/registro" className="card-link">
              <article className="card">
                <img
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60"
                  alt="Burger"
                />
                <h3>Únete a Yami</h3>
                <p>Elige uno de nuestros planes y empieza a disfrutar.</p>
              </article>
            </Link>

            <Link to="/registro" className="card-link">
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
