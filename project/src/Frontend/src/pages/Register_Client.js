import React, {useState} from "react";
import axios from "axios";
import {Link, Links, useNavigate} from "react-router-dom";
import "../css/Register_client.css";

const Register_client = () => {
  const [mensaje, setMensaje] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [dni_nie, setDniNie] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [tipoPlan, setTipoPlan] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== passwordRepeat) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    const nuevoCliente = {
      email,
      password,
      sub_plan: tipoPlan,
      name: nombre,
      surname: apellidos,
      address: direccion,
      city: ciudad,
      postal_code: codigoPostal,
      dni: dni_nie,
      phone_number: telefono,
    };

    try {
      //Devuelve mensajes del tipo
      //"message": "Cliente creado exitosamente", "client_id": 12345
      const {data} = await axios.post(`http://127.0.0.1:8000/api/create_client`, nuevoCliente);

      if (!data || !data.client_id) {
        setMensaje("No se ha podido crear el usuario");
        return;
      }

      localStorage.setItem("client_id", data.client_id);
      navigate("/restaurants");
      console.log("Cliente creado con id", data.client_id);
    } catch (error) {
      console.error("Error al crear el cliente", error);
      setMensaje("No se ha podido crear el usuario");
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister}>
        <h2>¡Bienvenido! Introduce tus datos para comenzar a usar Yami</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Ciudad"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Código Postal"
          value={codigoPostal}
          onChange={(e) => setCodigoPostal(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="DNI/NIE"
          value={dni_nie}
          onChange={(e) => setDniNie(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Método de pago"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/*Select para desplegable con varias opciones */}
        <select value={tipoPlan} onChange={(e) => setTipoPlan(e.target.value)} required>
          <option value="">Tipo de plan</option>
          <option value="Basic">Basic</option>
          <option value="Plus">Plus</option>
          <option value="Deluxe">Deluxe</option>
        </select>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Repetir contraseña"
          value={passwordRepeat}
          onChange={(e) => setPasswordRepeat(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
        {mensaje && <p>{mensaje}</p>}
      </form>
      <Link to="/" className="register-volver-inicio">
        Volver
      </Link>
    </div>
  );
};

export default Register_client;
