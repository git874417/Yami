import React, {useState, useEffect} from "react";
import "./../css/CarritoModal.css";

const CarritoModal = ({isOpen, onClose, carrito, setCarrito}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [carritoConDetalles, setCarritoConDetalles] = useState([]);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  // Cargar detalles de los platos cuando se abre el modal
  useEffect(() => {
    const cargarDetallesPlatos = async () => {
      if (carrito.length === 0) {
        setCarritoConDetalles([]);
        return;
      }

      try {
        const carritoActualizado = await Promise.all(
          carrito.map(async (item) => {
            try {
              const res = await fetch(`${API_BASE}/dishes/${item.dish_id}`);
              if (res.ok) {
                const dishData = await res.json();
                return {
                  ...item,
                  nombre: dishData.name,
                  descripcion: dishData.description,
                  credits: dishData.credits,
                  imagen: dishData.image_url,
                  dish_type: dishData.dish_type,
                  cantidad: 1,
                };
              }
            } catch (error) {
              console.error(`Error cargando plato ${item.dish_id}:`, error);
            }
            return item;
          })
        );
        setCarritoConDetalles(carritoActualizado);
      } catch (error) {
        console.error("Error cargando detalles del carrito:", error);
      }
    };

    if (isOpen) {
      cargarDetallesPlatos();
    }
  }, [isOpen, carrito, API_BASE]);

  const incrementarCantidad = (index) => {
    const nuevoCarrito = carritoConDetalles.map((producto, i) =>
      i === index ? {...producto, cantidad: producto.cantidad + 1} : producto
    );
    setCarritoConDetalles(nuevoCarrito);
  };

  const decrementarCantidad = (index) => {
    const nuevoCarrito = carritoConDetalles
      .map((producto, i) => {
        if (i === index) {
          if (producto.cantidad === 1) {
            return null;
          }
          return {...producto, cantidad: producto.cantidad - 1};
        }
        return producto;
      })
      .filter((producto) => producto !== null);

    setCarritoConDetalles(nuevoCarrito);
  };

  const eliminarProducto = (index) => {
    const nuevoCarrito = carritoConDetalles.filter((_, i) => i !== index);
    setCarritoConDetalles(nuevoCarrito);

    // Actualizar sessionStorage
    const carritoActualizado = nuevoCarrito.map(({nombre, descripcion, cantidad, ...rest}) => rest);
    setCarrito(carritoActualizado);
    sessionStorage.setItem("carrito", JSON.stringify(carritoActualizado));
  };

  const calcularTotal = () => {
    return carritoConDetalles.reduce((total, producto) => {
      return total + (producto.credits || 0) * (producto.cantidad || 1);
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);

      const userSession = sessionStorage.getItem("user");
      if (!userSession) {
        alert("Por favor, inicia sesión para realizar el pedido");
        return;
      }

      const user = JSON.parse(userSession);

      const orderData = {
        dishes: carritoConDetalles.map((producto) => ({
          dish_id: producto.dish_id,
          instructions: producto.instructions || "",
        })),
      };

      const restaurantId = carritoConDetalles[0]?.restaurant_id;

      if (!restaurantId) {
        alert("Error: No hay restaurante asociado al carrito");
        return;
      }

      const orderRes = await fetch(`${API_BASE}/api/create_order/${user.client_id}/${restaurantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        throw new Error(error.detail || "Error al crear el pedido");
      }

      const response = await orderRes.json();
      alert(`✓ Pedido creado exitosamente. ID: ${response.order_id}`);

      setCarrito([]);
      setCarritoConDetalles([]);
      sessionStorage.removeItem("carrito");
      onClose();
    } catch (error) {
      console.error("Error en checkout:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  const total = calcularTotal();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-button">
          ✕
        </button>
        <h2>🛒 Carrito de Compras</h2>

        {carritoConDetalles && carritoConDetalles.length === 0 ? (
          <p className="empty-cart">El carrito está vacío</p>
        ) : (
          <>
            <ul className="carrito-list">
              {carritoConDetalles.map((producto, index) => (
                <li key={index} className="producto-item">
                  <img
                    src={producto.imagen || "https://via.placeholder.com/100x100?text=No+imagen"}
                    alt={producto.nombre}
                    className="producto-imagen"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100x100?text=No+imagen";
                    }}
                  />
                  <div className="producto-info">
                    <h3>{producto.nombre}</h3>
                    <p className="producto-tipo">{producto.dish_type}</p>
                    <p className="producto-instrucciones">
                      {producto.instructions ? `📝 ${producto.instructions}` : "Sin instrucciones"}
                    </p>
                    <div className="cantidad-control">
                      <button onClick={() => decrementarCantidad(index)}>−</button>
                      <p>{producto.cantidad}</p>
                      <button onClick={() => incrementarCantidad(index)}>+</button>
                    </div>
                    <p className="producto-precio">
                      {(() => {
                        const totalCredits = (producto.credits || 0) * (producto.cantidad || 1);
                        return `${totalCredits} ${totalCredits === 1 ? 'Yameat' : 'Yameats'}`;
                      })()}
                    </p>
                    <button onClick={() => eliminarProducto(index)} className="btn-eliminar">
                      🗑️ Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="carrito-footer">
              <div className="total-section">
                <span className="total-label">Total:</span>
                <span className="total-amount">{total} {total === 1 ? 'Yameat' : 'Yameats'}</span>
              </div>
              <button
                className="btn-checkout"
                onClick={handleCheckout}
                disabled={isCheckingOut || carritoConDetalles.length === 0}
              >
                {isCheckingOut ? "Procesando..." : "Realizar Pedido"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CarritoModal;
