import React from "react";
import {Link} from "react-router-dom";
import "../css/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>¡Bienvenido a Yami!</h1>
          <p className="hero-sub">Yami es tu nuevo servicio de comida a domicilio.</p>
          <div className="hero-actions">
            <Link to="/registro" className="btn-primary">
              ¡Forma parte de Yami!
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1604156871290-8b49d2d8f6b6?auto=format&fit=crop&w=1200&q=80"
            alt="Comida"
          />
        </div>
      </section>

      <section className="cards">
        <div className="cards-inner">
          <h2>Unete a Yami!</h2>
          <div className="card-grid">
            <article className="card">
              <img
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60"
                alt="Burger"
              />
              <h3>Únete a Yami</h3>
              <p>Elige uno de nuestros planes y empieza a disfrutar.</p>
            </article>

            <article className="card">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60"
                alt="Vende"
              />
              <h3>Vende con Yami</h3>
              <p>Ofrece tus servicios a través de Yami.</p>
            </article>

            <article className="card">
              <div className="placeholder-box" />
              <h3>Reparte con Yami</h3>
              <p>Únete a nuestro equipo de repartidores.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
