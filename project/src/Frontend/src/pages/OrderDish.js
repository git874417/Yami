import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../css/OrderDish.css';

const OrderDish = () => {
  const { restaurantName, dishName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get dish data from state
  const dishData = location.state?.dish;
  
  // Convert allergens string to array if necessary
  const getAllergens = (allergens) => {
    if (!allergens) return [];
    if (Array.isArray(allergens)) return allergens;
    if (typeof allergens === 'string') {
      return allergens.split(',').map(a => a.trim()).filter(Boolean);
    }
    return [];
  };
  
  const [orderData, setOrderData] = useState({
    dishName: dishData?.name || '',
    dishDescription: dishData?.description || '',
    credits: dishData?.credits || 0,
    instructions: '',
    allergens: getAllergens(dishData?.allergens),
    dishImage: dishData?.image_url || 'https://via.placeholder.com/800x600?text=Cargando...'
  });

  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);

  const handleAddToCart = async () => {
    try {
      const newItem = {
        id: Date.now(),
        name: orderData.dishName,
        credits: orderData.credits,
        instructions: orderData.instructions
      };
      
      // Aquí guardarías en el carrito (localStorage o estado global)
      /*
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      currentCart.push(newItem);
      localStorage.setItem('cart', JSON.stringify(currentCart)); 
      setCart(currentCart);
      */
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

  if (!dishData) {
    return (
      <div className="order-dish-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>No se encontró información del plato</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-dish-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-dish-container">
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
            <strong>{orderData.credits} Yameats</strong>
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
    </div>
  );
};

export default OrderDish;
