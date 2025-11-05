import React from "react";
import "../css/Footer.css";
import {Link} from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <div className="footer-titulo-redes">
        <li className="titulo-yami">Yami</li>
        <li>Ig</li>
      </div>
      <div className="footer-otras-opciones">
        <ul>
          <li>
            <Link to="/register-restaurante" className="footer-link-register-restaurante">
              Añade tu restaurante
            </Link>
          </li>
          <li>
            <Link to="/normativa-restaurantes" className="footer-link-normativa-restaurantes">
              Normativa para restaurantes
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
