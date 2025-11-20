import React, {useState} from "react";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";
import Modal from "../components/Modal";
import "../css/Register_Restaurant.css";

const Register_Restaurant = () => {
  const [mensaje, setMensaje] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [telefono, setTelefono] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  // Manejar selección de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== passwordRepeat) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setMensaje("");

    const nuevoRestaurante = {
      email,
      password,
      name: nombre,
      description: descripcion,
      address: direccion,
      city: ciudad,
      category: categoria,
      phone_number: telefono,
    };

    try {
      // 1. Crear el restaurante
      const {data} = await axios.post(`${API_BASE}/api/create_restaurant`, nuevoRestaurante);

      if (!data || !data.restaurant_id) {
        setMensaje("No se ha podido crear el restaurante");
        setLoading(false);
        return;
      }

      const restaurantId = data.restaurant_id;
      console.log("Restaurante creado con id", restaurantId);

      // 2. Si hay logo, subirlo
      if (logoFile && restaurantId) {
        const formData = new FormData();
        formData.append("file", logoFile);

        console.log("Uploading logo for restaurant ID:", restaurantId);

        await axios.put(
          `${API_BASE}/api/upload/restaurant_image/${restaurantId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Logo uploaded successfully");
      }

      // Guardar en sessionStorage para mantener la sesión
      sessionStorage.setItem("restaurant_id", restaurantId);
      sessionStorage.setItem("role_id", restaurantId);
      sessionStorage.setItem("user_id", data.user_id);
      sessionStorage.setItem("role", "Restaurant");
      sessionStorage.setItem("profile_picture", data.profile_picture || "");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al crear el restaurante", error);
      setMensaje(error.response?.data?.detail || "No se ha podido crear el restaurante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-restaurant-container">
      <form onSubmit={handleRegister}>
        <h2>¡Bienvenido! Registra tu Restaurante en Yami</h2>
        
        {/* Logo Upload Section */}
        <div className="logo-upload-section">
          <div className="logo-preview-container">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo Preview" className="logo-preview" />
            ) : (
              <div className="logo-placeholder">
                <p>🏪</p>
                <p>Logo del Restaurante</p>
              </div>
            )}
          </div>
          <label htmlFor="logo-upload" className="upload-logo-button">
            {logoFile ? "Cambiar Logo" : "Seleccionar Logo"}
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleLogoChange}
            style={{display: "none"}}
          />
        </div>

        <input
          type="text"
          placeholder="Nombre del Restaurante"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
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
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
          <option value="">Categoría</option>
          <option value="Italiano">Italiano</option>
          <option value="Asiático">Asiático</option>
          <option value="Hamburguesería">Hamburguesería</option>
          <option value="Turco">Turco</option>
          <option value="Asador">Asador</option>
          <option value="Comida Rapida">Comida Rapida</option>
          <option value="Mexicano">Mexicano</option>
          <option value="Indio">Indio</option>
          <option value="Griego">Griego</option>
          <option value="Bocatería">Bocatería</option>
          <option value="Saludable">Saludable</option>
          <option value="Vegana">Vegana</option>
          <option value="Heladería">Heladería</option>
        </select>
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
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
        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar Restaurante"}
        </button>
        {mensaje && <p>{mensaje}</p>}
      </form>
      <Link to={"/"} className="register-restaurant-volver-inicio">
        Volver
      </Link>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/");
        }}
        title="✓ Éxito"
        actions={[
          {
            label: "Aceptar",
            onClick: () => {
              setShowSuccessModal(false);
              navigate("/");
            },
            className: "modal-action-button-primary"
          }
        ]}
      >
        <p>Restaurante creado exitosamente</p>
      </Modal>
    </div>
  );
};

export default Register_Restaurant;
