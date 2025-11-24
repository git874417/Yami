import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Services.css";

const Services = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: "basic",
      name: "Plan Básico",
      credits: 30,
      price: "63,99€/mes",
      description: "Perfecto para comenzar",
      features: [
      ],
    },
    {
      id: "plus",
      name: "Plan Plus",
      credits: 60,
      price: "129,99€/mes",
      description: "La opción más popular",
      features: [
      ],
      highlighted: true,
    },
    {
      id: "deluxe",
      name: "Plan Deluxe",
      credits: 100,
      price: "209,99€/mes",
      description: "Para los más exigentes",
      features: [
      ],
    },
  ];

  const dishTypes = [
    {
      type: "Entrante",
      credits: "3 Yameats",
      description: "Aperitivos y entrantes",
    },
    {
      type: "Principal",
      credits: "5 Yameats",
      description: "Platos principales",
    },
    {
      type: "Postre",
      credits: "3 Yameats",
      description: "Postres y dulces",
    },
    {
      type: "Bebida",
      credits: "1 Yameat",
      description: "Bebidas variadas",
    },
  ];

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-content">
          <h1>Descubre nuestro sistema</h1>
          <p>
            Mediante nuestro sencillo sistema de suscripción, no tendrás que
            preocuparte por el precio de cada plato.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="services-container">
        <div className="plans-section">
          <h2>Primero, elige uno de los tres planes:</h2>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${plan.highlighted ? "highlighted" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.highlighted && <div className="popular-badge">POPULAR</div>}

                <h3>{plan.name}</h3>

                <div className="plan-credits">
                  <span className="credit-number">{plan.credits}</span>
                  <span className="credit-label">Yameats al mes</span>
                </div>

                <div className="plan-price">{plan.price}</div>

                <p className="plan-description">{plan.description}</p>

                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`plan-button ${
                    selectedPlan === plan.id ? "selected" : ""
                  }`}
                >
                  {selectedPlan === plan.id ? "Seleccionado" : "Seleccionar"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Credits Info */}
        <div className="credits-info">
          <h3>¿Qué son los <span className="yameats-highlight">Yameats</span>?</h3>
          <div className="credits-content">
            <p className="credits-intro">
              Los Yameats son el <strong>corazón del sistema de Foodflix</strong>. Se trata de créditos virtuales que funcionan como moneda dentro de nuestra plataforma. <em>Cada mes</em>, según el plan que hayas elegido, recibirás una cantidad de Yameats que podrás utilizar libremente para adquirir cualquier plato de nuestros restaurantes colaboradores.
            </p>
            <p className="credits-intro">
              El costo de cada plato varía en función de su tipo: los <strong>entrantes y bebidas son más económicos</strong>, mientras que los <strong>platos principales</strong> tienen un valor superior. De esta forma, tienes <strong>total libertad para elegir</strong> exactamente lo que deseas comer cada mes, sin sorpresas en los precios.
            </p>
            <p className="credits-intro">
              Cuando encargues un plato, el sistema deducirá automáticamente los Yameats correspondientes de tu saldo disponible. 
            </p>
            <p className="credits-intro final-text">
              ¿No sabes qué comer? <strong>Consulta la tabla de precios</strong> a continuación y ¡elige lo que más te apetezca!
            </p>
          </div>
        </div>

        {/* Dish Types Table */}
        <div className="dish-types-section">
          <div className="dish-types-grid">
            {dishTypes.map((dish, idx) => (
              <div key={idx} className="dish-type-card">
                <h4>{dish.type}</h4>
                <div className="credits-value">{dish.credits}</div>
                <p>{dish.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <section className="benefits-section">
          <h2>¿Por qué elegir Yami?</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Sistema Simple</h3>
              <p>
                Olvídate de preocuparte por el precio de cada plato con nuestro
                sistema de créditos
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🍔</div>
              <h3>Variedad</h3>
              <p>
                Acceso a múltiples restaurantes con diferentes tipos de cocina
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Rápido y Fácil</h3>
              <p>Realiza tu pedido en apenas unos pocos clics</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Ahorros</h3>
              <p>Planes diseñados para ofrecerte el mejor valor</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">📱</div>
              <h3>Siempre Disponible</h3>
              <p>Accede a nuestros servicios desde cualquier dispositivo</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🏆</div>
              <h3>Calidad Garantizada</h3>
              <p>Todos nuestros restaurantes cumplen altos estándares</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>¿Listo para comenzar?</h2>
          <p>Elige tu plan y comienza a disfrutar de deliciosa comida hoy</p>
          <button className="cta-button" onClick={() => navigate("/registerClient")}>
            Registrarse ahora
          </button>
        </section>
      </section>
    </div>
  );
};

export default Services;
