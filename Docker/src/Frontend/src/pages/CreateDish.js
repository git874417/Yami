import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../css/CreateDish.css";
import axios from "axios";

const CreateDish = () => {
  const navigate = useNavigate();

  const [dishData, setDishData] = useState({
    name: "",
    description: "",
    credits: "",
    category: "",
    allergens: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = "";

  // Lista de alérgenos disponibles
  const availableAllergens = [
    "Gluten",
    "Huevos",
    "Lácteos",
    "Pescado",
    "Soja",
    "Nueces",
    "Crustáceos",
    "Moluscos",
    "Mostaza",
    "Sésamo",
    "Sulfitos",
    "Cacahuetes",
    "Granos de Sésamo",
    "Dióxido de Azufre y Sulfitos",
  ];

  // Manejar cambio en campos de texto
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setDishData({...dishData, [name]: value});
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar toggle de alérgenos
  const handleAllergenToggle = (allergen) => {
    setDishData((prev) => {
      const allergens = prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen];
      return {...prev, allergens};
    });
  };

  // Crear plato
  const handleCreateDish = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar campos requeridos
      if (!dishData.name || !dishData.description || !dishData.category) {
        alert("Por favor, completa todos los campos obligatorios");
        setLoading(false);
        return;
      }

      const restaurantId = sessionStorage.getItem("role_id");
      if (!restaurantId) {
        alert("Por favor, inicia sesión como restaurante");
        navigate("/inicio-sesion");
        return;
      }

      // 1. Crear el plato primero (sin imagen)
      const dishPayload = {
        name: dishData.name,
        description: dishData.description,
        allergens: dishData.allergens.join(", "),
        dish_type: dishData.category,
      };

      console.log("Creating dish:", dishPayload);

      // Crear el plato en el backend
      const createDishResponse = await axios.post(`${API_BASE}/api/create_dish/${restaurantId}`, dishPayload);

      const createdDish = createDishResponse.data;
      const dishId = createdDish.dish_id;

      console.log("Dish created successfully with ID:", dishId, createdDish);

      // 2. Si hay imagen, subirla DESPUÉS de crear el plato
      if (imageFile && dishId) {
        const formData = new FormData();
        formData.append("file", imageFile);

        console.log("Uploading image for dish ID:", dishId);

        // PUT al endpoint de upload de imagen
        const uploadImageResponse = await axios.put(`${API_BASE}/api/upload/dish_image/${dishId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Image uploaded successfully:", uploadImageResponse.data);
      }

      // 3. Obtener el nombre del restaurante para la navegación
      const restaurantResponse = await axios.get(`${API_BASE}/api/restaurant/${restaurantId}`);
      const restaurantName = restaurantResponse.data.name;

      alert("✓ Plato creado exitosamente");
      navigate(`/restaurantPage/${encodeURIComponent(restaurantName)}`); // Navegar a la página del restaurante
    } catch (error) {
      console.error("Error al crear el plato:", error.response?.data || error.message);
      setError(error.response?.data?.detail || "Hubo un error al crear el plato");
      alert("Error al crear el plato. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getAllergenIcon = (allergen) => {
    const icons = {
      Gluten: "🌾",
      Huevos: "🥚",
      Huevo: "🥚",
      Lácteos: "🥛",
      Lactosa: "🥛",
      Pescado: "🐟",
      Soja: "🌱",
      "Frutos de Cáscara": "🌰",
      Nueces: "🥜",
      Cacahuetes: "🥜",
      Moluscos: "🐚",
      Mostaza: "🌭",
      "Granos de Sésamo": "🌾",
      Sésamo: "🌾",
      "Dióxido de Azufre y Sulfitos": "💨",
      Sulfitos: "⚗️",
      Crustáceos: "🦐",
      Marisco: "🦐",
    };
    return icons[allergen] || "⚠️";
  };

  if (loading) {
    return (
      <div className="create-dish-container">
        <div className="loading-container">
          <p>Creando plato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-dish-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-dish-container">
      <h1 className="page-title">Crear Nuevo Plato</h1>

      {/* Main Content */}
      <div className="create-content">
        {/* Imagen del plato - lado izquierdo */}
        <div className="image-upload-section">
          <div className="image-preview-container">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <p>📷</p>
                <p>Selecciona una imagen</p>
              </div>
            )}
          </div>
          <label htmlFor="image-upload" className="upload-button">
            {imageFile ? "Cambiar Imagen" : "Seleccionar Imagen"}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{display: "none"}}
          />
        </div>

        {/* Formulario del plato - lado derecho */}
        <div className="dish-form">
          {/* Nombre del plato */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre del Plato
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Introduzca el nombre del Plato"
              value={dishData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Introduzca la descripción del Plato"
              value={dishData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          {/* Categoría y Precio */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={dishData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar</option>
              <option value="Entrante">Entrante</option>
              <option value="Principal">Principal</option>
              <option value="Postre">Postre</option>
              <option value="Bebida">Bebida</option>
            </select>
          </div>

          {/* Alérgenos */}
          <div className="form-group">
            <label className="form-label">Alérgenos</label>
            <div className="allergens-grid">
              {availableAllergens.map((allergen) => (
                <label key={allergen} className="allergen-checkbox-label">
                  <input
                    type="checkbox"
                    checked={dishData.allergens.includes(allergen)}
                    onChange={() => handleAllergenToggle(allergen)}
                  />
                  <span className="allergen-icon-small">{getAllergenIcon(allergen)}</span>
                  <span>{allergen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botón crear */}
          <button className="btn-create-dish" onClick={handleCreateDish} disabled={loading}>
            {loading ? "Creando..." : "Actualizar la Carta"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CreateDish;
