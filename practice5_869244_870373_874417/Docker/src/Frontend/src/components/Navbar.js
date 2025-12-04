/*Componente de barra de navegación*/

import React, {useState, useEffect} from "react";
import "./../css/Navbar.css";
import {Link, useNavigate} from "react-router-dom";

const Navbar = ({location}) => {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const role = sessionStorage.getItem("role");
    const profilePic = sessionStorage.getItem("profile_picture");
    
    if (userId) {
      setUser({ id: userId, role });
      setProfilePicture(profilePic);
    }

    // Cargar contador del carrito
    const updateCartCount = () => {
      const carrito = sessionStorage.getItem("carrito");
      if (carrito) {
        try {
          const carritoObj = JSON.parse(carrito);
          setCartCount(carritoObj.dishes?.length || 0);
        } catch (error) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();

    // Escuchar cambios en el carrito
    window.addEventListener("carritoActualizado", updateCartCount);
    return () => window.removeEventListener("carritoActualizado", updateCartCount);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("profile_picture");
    sessionStorage.removeItem("carrito");
    setUser(null);
    setProfilePicture(null);
    navigate("/");
  };

  const pathname = location?.pathname || "/";
  const isLoggedIn = !!user;
  const inRestaurant = isLoggedIn && pathname.includes("/restaurants/");
  const mostrarCarrito = inRestaurant && !pathname.includes("/restaurantPage/");

  const mostrarLoginButtons = !isLoggedIn && pathname === "/";
  const mostrarLoginButton = !isLoggedIn && (pathname === "/" || pathname.includes("/register"));
  
  const handleCarritoClick = () => {
    navigate("/carrito");
  };

  return (
    <nav className="navbar">
      {/*       <div className="navbar-centro">
        <a href="/carrito" className="carrito-icono">
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-count">0</span>
        </a>
      </div>*/}
      <div className="navbar-derecha">
        <ul className="nav-links">
          <li>
            <Link to="/servicios" className="nav-link-servicios">
              Servicios
            </Link>
          </li>

          {isLoggedIn && user?.role === "Client" && (
            <li>
              <Link to="/mis-pedidos" className="nav-link-mis-pedidos">
                Mis Pedidos
              </Link>
            </li>
          )}

          {mostrarLoginButton && (
            <li>
              <Link to="/inicio-sesion" className="navbar-button navbar-button-inicio-sesion">
                Iniciar Sesión
              </Link>
            </li>
          )}

          {mostrarLoginButtons && (
            <li>
              <Link to="/registerClient" className="navbar-button navbar-button-registro">
                Registrarse
              </Link>
            </li>
          )}
  
          {mostrarCarrito && (
            <li>
              <button onClick={handleCarritoClick} className="navbar-button carrito-button">
                🛒
                <span className="cart-count">{cartCount}</span>
              </button>
            </li>
          )}

          {isLoggedIn && (
            <>
              <li>
                <button onClick={handleLogout} className="navbar-button navbar-button-logout">
                  Cerrar Sesión
                </button>
              </li>
              <li>
                <button 
                  className="navbar-button profile-picture-button"
                  onClick={() => navigate("/profile")}
                >
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="profile-picture"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/6.x/initials/svg?seed=${user?.id || 'U'}`;
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.id || 'U'}`}
                      alt="Profile" 
                      className="profile-picture"
                    />
                  )}
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
