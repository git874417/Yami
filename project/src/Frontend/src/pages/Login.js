import React, {useState} from "react";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";
import "./../css/Login.css";
import ShopPage from "./ShopPage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMensaje("Por favor, completa todos los campos");
      return;
    }

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
      navigate("/restaurants");

      console.log("Login correcto:");
    } catch (error) {
      console.error("Error en el login", error);
      setMensaje("No se pudo hacer login");
    }
  };

  return (
    <body>
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
