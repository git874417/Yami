/*Componente de barra de navegación*/

import React, {useState, useEffect} from "react";
import "./../css/Navbar.css";
import {Link, useNavigate} from "react-router-dom";

const Navbar = ({onCarritoClick, carritoCount = 0, location}) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const userSession = sessionStorage.getItem("user_id");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("carrito");
    setUser(null);
    navigate("/");
  };

  const pathname = location?.pathname || "/"; // Obtenemos la ruta actual
  const isLoggedIn = !!user; // Convertimos 'user' a booleano (true si existe, false si es null)
  const mostrarCarrito = isLoggedIn && pathname.startsWith("/restaurants/");

  const mostrarLoginButtons = !isLoggedIn && pathname === "/"; //solo en home

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

          {mostrarLoginButtons && (
            <>
              <li>
                <Link to="/inicio-sesion" className="navbar-button navbar-button-inicio-sesion">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/registerClient" className="navbar-button navbar-button-registro">
                  Registrarse
                </Link>
              </li>
            </>
          )}
  
          {mostrarCarrito && (
            <li>
              <button onClick={onCarritoClick} className="navbar-button carrito-button">
                🛒
                <i className="fas fa-shopping-cart"></i>
                {carritoCount > 0 && <span className="cart-count">{carritoCount}</span>}
              </button>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <button onClick={handleLogout} className="navbar-button navbar-button-logout">
                Cerrar Sesión
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
