import React, {useState} from "react";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";
import "./../css/Login.css";
import ShopPage from "./ShopPage";
import LoadingScreen from "../components/LoadingScreen";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMensaje("Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);
    setMensaje("");

    try {
      //Data es un mensaje de tipo:
      //{"message": "Login exitoso", "user_id": 12345, "role": "cliente"}
      const {data} = await axios.post(`http://127.0.0.1:8000/api/login`, {
        email,
        password,
      });

      if (!data.user_id) return setMensaje("Usuario o contraseña incorrectos");

      sessionStorage.setItem("user_id", data.user_id);
      sessionStorage.setItem("role_id", data.role_id);
      sessionStorage.setItem("role", data.role);
      sessionStorage.setItem("profile_picture", data.profile_picture || "");
      sessionStorage.setItem("email", email);

      console.log("Login correcto:", data);

      // Redirigir según el rol del usuario
      if (data.role === "Admin" || data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "Restaurant" || data.role === "restaurant") {
        // Si es restaurante, obtenemos todos los restaurantes y buscamos por role_id
        try {
          const restaurantsResponse = await axios.get(`http://127.0.0.1:8000/api/restaurants`);
          const restaurant = restaurantsResponse.data.restaurants.find(r => r.id === data.role_id);
          
          if (restaurant) {
            sessionStorage.setItem("restaurant_name", restaurant.name);
            navigate(`/restaurantPage/${encodeURIComponent(restaurant.name)}`);
          } else {
            setMensaje("No se encontró el restaurante asociado");
          }
        } catch (error) {
          console.error("Error obteniendo datos del restaurante:", error);
          setMensaje("Error al cargar datos del restaurante");
        }
      } else {
        // Si es cliente, redirigir a la página de restaurantes
        navigate("/restaurants");
      }
    } catch (error) {
      console.error("Error en el login", error);
      // Capturar el mensaje específico del backend
      if (error.response?.data?.detail) {
        setMensaje(error.response.data.detail);
      } else {
        setMensaje("No se pudo hacer login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <body>
      {isLoading && <LoadingScreen />}
      <div className="login-container">
        <h2>¡Bienvenido de vuelta!</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />

          {/*el input nos permite elegir el tipo de input */}
          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
        <p>{mensaje}</p>
        <Link to="/" className="login-volver-inicio">
          Volver
        </Link>
      </div>
    </body>
  );
};

export default Login;
