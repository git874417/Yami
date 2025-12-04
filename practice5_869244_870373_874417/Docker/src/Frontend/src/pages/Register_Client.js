import React, {useState, useEffect} from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const selectedPlan = localStorage.getItem("selectedPlan");
    if (selectedPlan && ["Basic", "Plus", "Deluxe"].includes(selectedPlan)) {
      setTipoPlan(selectedPlan);
      localStorage.removeItem("selectedPlan");
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== passwordRepeat) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    setMensaje("");

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
      const {data} = await axios.post(`/api/create_client`, nuevoCliente);

      if (!data || !data.client_id) {
        setMensaje("No se ha podido crear el usuario");
        setIsLoading(false);
        return;
      }

      // Guardar en sessionStorage para mantener la sesión
      sessionStorage.setItem("client_id", data.client_id);
      sessionStorage.setItem("role_id", data.client_id);
      sessionStorage.setItem("user_id", data.user_id);
      sessionStorage.setItem("role", "Client");
      sessionStorage.setItem("profile_picture", data.profile_picture || "");
      navigate("/restaurants");
      console.log("Cliente creado con id", data.client_id);
    } catch (error) {
      console.error("Error al crear el cliente", error);
      setMensaje("No se ha podido crear el usuario");
      setIsLoading(false);
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

        {/* Plan Selection - 3 parallel boxes */}
        <div className="plan-selection-container">
          <label className="plan-label">Selecciona tu plan *</label>
          <div className="plans-row">
            {/* Basic Plan */}
            <div
              className={`plan-card ${tipoPlan === "Basic" ? "selected" : ""}`}
              onClick={() => setTipoPlan("Basic")}
            >
              <div className="plan-name">Basic</div>
              <div className="plan-price">
                63,99€<span className="plan-price-period">/mes</span>
              </div>
              <div className="plan-credits">30 Yameats</div>
            </div>

            {/* Plus Plan */}
            <div
              className={`plan-card ${tipoPlan === "Plus" ? "selected" : ""}`}
              onClick={() => setTipoPlan("Plus")}
            >
              <div className="plan-name">Plus</div>
              <div className="plan-price">
                129,99€<span className="plan-price-period">/mes</span>
              </div>
              <div className="plan-credits">60 Yameats</div>
            </div>

            {/* Deluxe Plan */}
            <div
              className={`plan-card ${tipoPlan === "Deluxe" ? "selected" : ""}`}
              onClick={() => setTipoPlan("Deluxe")}
            >
              <div className="plan-name">Deluxe</div>
              <div className="plan-price">
                209,99€<span className="plan-price-period">/mes</span>
              </div>
              <div className="plan-credits">100 Yameats</div>
            </div>
          </div>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creando Cliente..." : "Registrarse"}
        </button>
        {mensaje && <p>{mensaje}</p>}
      </form>
      <Link to="/" className="register-volver-inicio">
        Volver
      </Link>
    </div>
  );
};

export default Register_client;
