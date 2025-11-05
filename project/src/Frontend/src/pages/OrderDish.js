import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/OrderDish.css';

const OrderDish = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState({
    dishName: 'Doble Cheeseburger',
    dishDescription: 'Hamburguesa con doble carne de vacuno, queso cheddar, ketchup, mostaza y pan brioche',
    credits: 10,
    instructions: '',
    allergens: ['Lactosa', 'Gluten', 'Nueces'],
    dishImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop'
  });

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);

  // Cargar datos del plato desde el backend
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        // Aquí conectarías con tu API
        // const response = await fetch(`http://localhost:8000/api/dish/${orderId}`);
        // const data = await response.json();
        // setOrderData(data);
      } catch (error) {
        console.error('Error fetching order data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      // fetchOrderData();
    }
  }, [orderId]);

  const handleAddToCart = async () => {
    try {
      const newItem = {
        id: Date.now(),
        name: orderData.dishName,
        credits: orderData.credits,
        instructions: orderData.instructions
      };
      
      // Aquí guardarías en el carrito (localStorage o estado global)
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      currentCart.push(newItem);
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      setCart(currentCart);
      alert('✓ Plato añadido al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al añadir al carrito');
    }
  };

  const getAllergenIcon = (allergen) => {
    const icons = {
      'Lactosa': '🥛',
      'Gluten': '🌾',
      'Nueces': '🥜',
      'Huevo': '🥚',
      'Pescado': '🐟',
      'Marisco': '🦐',
      'Soja': '🌱'
    };
    return icons[allergen] || '⚠️';
  };

  if (loading) {
    return (
      <div className="order-dish-container">
        <div className="loading-container">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-dish-container">
      {/* Header */}
      <header className="order-header">
        <div className="logo" onClick={() => navigate('/')}>Yami</div>
        <nav className="nav-links">
          <a href="/" className="nav-link">Inicio</a>
          <a href="/menu" className="nav-link">Menú</a>
          <a href="/pedidos" className="nav-link">Mis Pedidos</a>
          <button className="btn-primary" onClick={() => navigate('/cart')}>
            Carrito ({cart.length})
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="order-content">
        {/* Imagen del plato */}
        <div className="dish-image-container">
          <img 
            src={orderData.dishImage} 
            alt={orderData.dishName}
            className="dish-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600?text=Imagen+no+disponible';
            }}
          />
        </div>

        {/* Información del plato */}
        <div className="dish-info">
          <h1 className="dish-title">{orderData.dishName}</h1>
          <p className="dish-description">{orderData.dishDescription}</p>
          
          <div className="dish-credits">
            <strong>{orderData.credits} Créditos</strong>
          </div>

          {/* Instrucciones */}
          <div className="instructions-section">
            <label htmlFor="instructions" className="instructions-label">
              Instrucciones
            </label>
            <textarea
              id="instructions"
              className="instructions-input"
              placeholder="Solicite instrucciones al Restaurante"
              value={orderData.instructions}
              onChange={(e) => setOrderData({...orderData, instructions: e.target.value})}
              rows={4}
            />
          </div>

          {/* Botón añadir al carrito */}
          <button className="btn-add-cart" onClick={handleAddToCart}>
            Añadir al carrito
          </button>

          {/* Alérgenos */}
          <div className="allergens-section">
            <p className="allergens-label">Alérgenos:</p>
            <div className="allergens-list">
              {orderData.allergens.map((allergen, index) => (
                <div key={index} className="allergen-badge">
                  <span className="allergen-icon">{getAllergenIcon(allergen)}</span>
                  <span className="allergen-name">{allergen}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="order-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">Yami</h3>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">📘</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">💼</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">📺</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">📷</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Empresa</h4>
            <ul className="footer-links">
              <li><a href="/about">Sobre Nosotros</a></li>
              <li><a href="/contact">Contacto</a></li>
              <li><a href="/careers">Trabaja con Nosotros</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="/privacy">Privacidad</a></li>
              <li><a href="/terms">Términos</a></li>
              <li><a href="/cookies">Cookies</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Ayuda</h4>
            <ul className="footer-links">
              <li><a href="/faq">Preguntas Frecuentes</a></li>
              <li><a href="/support">Soporte</a></li>
              <li><a href="/shipping">Envíos</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrderDish;
