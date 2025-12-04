import React, {useState, useEffect} from "react";
import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useModal} from "../context/ModalContext";
import "../css/EditRestaurant.css";

const EditRestaurant = () => {
  const [mensaje, setMensaje] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [telefono, setTelefono] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  const navigate = useNavigate();
  const {showModal} = useModal();
  const {restaurantId: restaurantNameUrl} = useParams();
  const API_BASE = "";

  // Cargar datos del restaurante
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const encodedName = encodeURIComponent(restaurantNameUrl);
        const response = await axios.get(`${API_BASE}/api/restaurants/name/${encodedName}`);
        const restaurant = response.data;

        setRestaurantId(restaurant.id);
        setNombre(restaurant.name || "");
        setDescripcion(restaurant.description || "");
        setDireccion(restaurant.address || "");
        setCiudad(restaurant.city || "");
        setCategoria(restaurant.category || "");
        setTelefono(restaurant.phone_number || "");

        // Set logo preview if exists
        if (restaurant.image_url) {
          setLogoPreview(restaurant.image_url);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading restaurant data:", error);
        setMensaje("Error al cargar los datos del restaurante");
        setLoading(false);
      }
    };

    if (restaurantNameUrl) {
      fetchRestaurantData();
    }
  }, [restaurantNameUrl, API_BASE]);

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

  const handleUpdate = async (e) => {
    e.preventDefault();

    setMensaje("");

    try {
      // 1. Actualizar datos del restaurante
      const updatePayload = {
        description: descripcion,
        address: direccion,
        city: ciudad,
        category: categoria,
        phone_number: telefono,
      };

      await axios.patch(`${API_BASE}/api/update_restaurant/${restaurantId}`, updatePayload);

      console.log("Restaurante actualizado exitosamente");

      // 2. Si hay nuevo logo, subirlo
      if (logoFile && restaurantId) {
        const formData = new FormData();
        formData.append("file", logoFile);

        console.log("Uploading new logo for restaurant ID:", restaurantId);

        await axios.put(`${API_BASE}/api/upload/restaurant_image/${restaurantId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Logo uploaded successfully");
      }

      // Recargar los datos del restaurante desde la API
      const encodedName = encodeURIComponent(nombre);
      const response = await axios.get(`${API_BASE}/api/restaurants/name/${encodedName}`);
      const updatedRestaurant = response.data;

      // Actualizar todos los estados con los datos actualizados
      setNombre(updatedRestaurant.name || "");
      setDescripcion(updatedRestaurant.description || "");
      setDireccion(updatedRestaurant.address || "");
      setCiudad(updatedRestaurant.city || "");
      setCategoria(updatedRestaurant.category || "");
      setTelefono(updatedRestaurant.phone_number || "");
      if (updatedRestaurant.image_url) {
        setLogoPreview(updatedRestaurant.image_url);
      }
      setLogoFile(null);

      showModal("Éxito", "Datos actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar el restaurante", error);
      showModal("Error", error.response?.data?.detail || "No se ha podido actualizar el restaurante");
    }
  };

  if (loading) {
    return (
      <div className="edit-restaurant-container">
        <div style={{textAlign: "center", padding: "3rem"}}>
          <p>Cargando datos del restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-restaurant-container">
      <form onSubmit={handleUpdate}>
        <h2>Modificar Datos del Restaurante</h2>

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
            {logoFile ? "Cambiar Logo" : "Actualizar Logo"}
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleLogoChange}
            style={{display: "none"}}
          />
        </div>

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
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
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <button type="submit">Guardar Cambios</button>
      </form>
      <Link to={`/restaurantPage/${encodeURIComponent(nombre)}`} className="edit-restaurant-volver-inicio">
        Cancelar
      </Link>
    </div>
  );
};

export default EditRestaurant;
