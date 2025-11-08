import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
const ShopPage = () => {
  //aqui se guardarán los datos de todos los restaurantes
  const [restaurantes, setRestaurantes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchRestaurantes = async () => {
    try {
      //cogemos los datos de todos los restaurantes.
      //devuelve lista de restaurantes en json
      const {restaurantesData} = await axios.get(`http://127.0.0.1:8000/api/restaurants`);

      setRestaurantes(data);
    } catch (error) {
      setMensaje(err.message);
    }
  };

  //para llamar al fetch cuando renderiza
  useEffect(() => {
    fetchRestaurantes();
  }, []);

  return (
    <main className="main-shop-page">
      <div className="shop-page-contenido">
        <header className="restaurante-header">
          <div className="restaurante-header-izq">
            <h1>Todos los restaurantes</h1>
            <p>Aquí encontrarás todos los restaurantes disponibles</p>
          </div>
        </header>
      </div>
    </main>
  );
};

export default ShopPage;
