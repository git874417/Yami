import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../css/OrderDish.css';

const OrderDish = () => {
  const { restaurantId, dishName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get dish data from navigation state
  const dishFromState = location.state?.dish;
  const restaurantFromState = location.state?.restaurant;
  
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
    dishName: dishFromState?.name || '',
    dishDescription: dishFromState?.description || '',
    credits: dishFromState?.credits || 0,
    instructions: '',
    allergens: getAllergens(dishFromState?.allergens),
    dishImage: dishFromState?.image_url || 'https://via.placeholder.com/800x600?text=Cargando...'
  });

  const [loading, setLoading] = useState(!dishFromState);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const normalizeUrl = (u) => {
    if (!u) return u;
    // Fix double slashes in URLs (common Supabase issue)
    let url = u.replace(/([^:]\/)\/+/g, '$1');
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return window.location.protocol + url;
    if (url.startsWith('/')) return API_BASE.replace(/\/$/, '') + url;
    return url;
  };

  // Cargar datos del plato desde el backend solo si no vienen del state
  useEffect(() => {
    // Si ya tenemos los datos del plato del state, no hacer fetch
    if (dishFromState) {
      console.log('Using dish data from state:', dishFromState);
      setLoading(false);
      return;
    }

    // Si no tenemos los datos, hacer fetch por nombre del plato
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!dishName || !restaurantId) {
          throw new Error('No se encontró información del plato');
        }
        
        console.log('Fetching dish by name:', dishName, 'from restaurant:', restaurantId);
        
        // Primero obtener los platos del restaurante
        const encodedRestaurantName = encodeURIComponent(restaurantId);
        const response = await fetch(`${API_BASE}/restaurants/name/${encodedRestaurantName}/dishes`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los platos`);
        }
        
        const dishes = await response.json();
        console.log('Dishes received:', dishes);
        
        // Buscar el plato por nombre
        const dish = dishes.find(d => d.name === decodeURIComponent(dishName));
        
        if (!dish) {
          throw new Error('No se encontró el plato');
        }
        
        console.log('Found dish:', dish);
        
        // Actualizar el estado con los datos del plato
        setOrderData({
          dishName: dish.name,
          dishDescription: dish.description,
          credits: dish.credits,
          instructions: '',
          allergens: getAllergens(dish.allergens),
          dishImage: dish.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop'
        });
      } catch (error) {
        console.error('Error fetching order data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [dishFromState, dishName, restaurantId, API_BASE]);

  const handleAddToCart = async () => {
    try {
      const newItem = {
        id: Date.now(),
        name: orderData.dishName,
        credits: orderData.credits,
        instructions: orderData.instructions
      };
      
      //Aquí guardaremos en el carrito
      alert('✓ Plato añadido al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al añadir al carrito');
    }
  };

  const getAllergenIcon = (allergen) => {
    const icons = {
      'Gluten': '🌾',
      'Huevos': '🥚',
      'Huevo': '🥚',
      'Lácteos': '🥛',
      'Lactosa': '🥛',
      'Pescado': '🐟',
      'Soja': '🌱',
      'Frutos de Cáscara': '�',
      'Nueces': '🥜',
      'Cacahuetes': '🥜',
      'Moluscos': '�',
      'Mostaza': '🌭',
      'Granos de Sésamo': '🌾',
      'Sésamo': '🌾',
      'Dióxido de Azufre y Sulfitos': '💨',
      'Sulfitos': '�',
      'Crustáceos': '🦐',
      'Marisco': '🦐'
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
