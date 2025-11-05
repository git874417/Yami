import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/OrderDish.css';

const OrderDish = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState({
    dishName: '',
    dishDescription: '',
    credits: 0,
    instructions: '',
    allergens: [],
    dishImage: 'https://via.placeholder.com/800x600?text=Cargando...'
  });

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);

  // Cargar datos del plato desde el backend
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching dish with ID:', orderId);
        
        // Conectamos con la API
        const response = await fetch(`http://localhost:8000/api/dish/${orderId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          throw new Error(errorData.detail || `Error ${response.status}: No se pudo cargar el plato`);
        }
        
        const data = await response.json();
        console.log('Dish data received:', data);
        
        // Procesamos los alérgenos: puede venir como string separado por comas o como array
        let allergensArray = [];
        if (data.allergens) {
          if (typeof data.allergens === 'string') {
            allergensArray = data.allergens.split(',').map(a => a.trim()).filter(a => a);
          } else if (Array.isArray(data.allergens)) {
            allergensArray = data.allergens;
          }
        }
        
        // Mapeamos los datos del backend al estado del frontend
        setOrderData({
          dishName: data.name,
          dishDescription: data.description,
          credits: data.credits,
          instructions: '',
          allergens: allergensArray,
          dishImage: data.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop'
        });
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
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

  if (loading) {
    return (
      <div className="order-dish-container">
        <div className="loading-container">
          <p>Cargando plato...</p>
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
