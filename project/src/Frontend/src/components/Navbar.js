/*Componente de barra de navegación*/

import React from "react";
import "./../css/Navbar.css";
import {Link} from "react-router-dom";

const Navbar = () => {
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
          <li>
            <Link to="/inicio-sesion" className="navbar-button navbar-button-inicio-sesion">
              Iniciar Sesión
            </Link>
          </li>
          <li>
            <Link to="/registro" className="navbar-button navbar-button-registro">
              Regístrate
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
