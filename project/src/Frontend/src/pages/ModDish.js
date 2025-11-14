import React, {useState, useEffect} from "react";
import {useParams, useNavigate, useLocation} from "react-router-dom";
import "../css/ModDish.css";
import axios from "axios";

const ModDish = () => {
  const {restaurantId: restaurantNameUrl, dishName} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get dish data from navigation state
  const dishFromState = location.state?.dish;
  const restaurantFromState = location.state?.restaurant;

  // Convert allergens string to array if necessary
  const getAllergens = (allergens) => {
    if (!allergens) return [];
    if (Array.isArray(allergens)) return allergens;
    if (typeof allergens === "string") {
      return allergens
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
    return [];
  };

  const [dishData, setDishData] = useState({
    dishId: dishFromState?.id || null,
    name: dishFromState?.name || "",
    description: dishFromState?.description || "",
    credits: dishFromState?.credits || "",
    category: dishFromState?.dish_type || "",
    allergens: getAllergens(dishFromState?.allergens),
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(dishFromState?.image_url || null);
  const [loading, setLoading] = useState(!dishFromState);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

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

  // Cargar datos del plato desde el backend solo si no vienen del state
  useEffect(() => {
    // Si ya tenemos los datos del plato del state, no hacer fetch
    if (dishFromState) {
      console.log("Using dish data from state:", dishFromState);
      setLoading(false);
      return;
    }

    // Si no tenemos los datos, hacer fetch por nombre del plato
    const fetchDishData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!dishName || !restaurantNameUrl) {
          throw new Error("No se encontró información del plato");
        }

        console.log("Fetching dish by name:", dishName, "from restaurant:", restaurantNameUrl);

        // Primero obtener los platos del restaurante
        const encodedRestaurantName = encodeURIComponent(restaurantNameUrl);
        const response = await fetch(`${API_BASE}/restaurants/name/${encodedRestaurantName}/dishes`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los platos`);
        }

        const dishes = await response.json();
        console.log("Dishes received:", dishes);

        // Buscar el plato por nombre
        const dish = dishes.find((d) => d.name === decodeURIComponent(dishName));

        if (!dish) {
          throw new Error("No se encontró el plato");
        }

        console.log("Found dish:", dish);

        // Actualizar el estado con los datos del plato
        setDishData({
          dishId: dish.id,
          name: dish.name,
          description: dish.description,
          credits: dish.credits || "",
          category: dish.dish_type || "",
          allergens: getAllergens(dish.allergens),
        });
        setImagePreview(dish.image_url || null);
      } catch (error) {
        console.error("Error loading dish:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDishData();
  }, [dishFromState, dishName, restaurantNameUrl, API_BASE]);

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

  // Actualizar plato
  const handleUpdateDish = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar campos requeridos
      if (!dishData.name || !dishData.description || !dishData.credits || !dishData.category) {
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

      if (!dishData.dishId) {
        alert("Error: No se pudo obtener el ID del plato");
        setLoading(false);
        return;
      }

      // 1. Actualizar los datos del plato
      const dishPayload = {
        name: dishData.name,
        description: dishData.description,
        allergens: dishData.allergens.join(", "),
        dish_type: dishData.category,
      };

      console.log("Updating dish:", dishPayload);

      // Actualizar el plato en el backend
      const updateDishResponse = await axios.put(
        `${API_BASE}/api/update_dish/${dishData.dishId}`,
        dishPayload
      );

      console.log("Dish updated successfully:", updateDishResponse.data);

      // 2. Si hay una nueva imagen, subirla
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        console.log("Uploading new image for dish ID:", dishData.dishId);

        const uploadImageResponse = await axios.put(
          `${API_BASE}/api/upload/dish_image/${dishData.dishId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Image uploaded successfully:", uploadImageResponse.data);
      }

      alert("✓ Plato actualizado exitosamente");
      navigate("/"); // O navegar a la página de gestión de platos del restaurante
    } catch (error) {
      console.error("Error al actualizar el plato:", error.response?.data || error.message);
      setError(error.response?.data?.detail || "Hubo un error al actualizar el plato");
      alert("Error al actualizar el plato. Inténtalo de nuevo.");
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
      "Frutos de Cáscara": "�",
      Nueces: "🥜",
      Cacahuetes: "🥜",
      Moluscos: "�",
      Mostaza: "🌭",
      "Granos de Sésamo": "🌾",
      Sésamo: "🌾",
      "Dióxido de Azufre y Sulfitos": "💨",
      Sulfitos: "�",
      Crustáceos: "🦐",
      Marisco: "🦐",
    };
    return icons[allergen] || "⚠️";
  };

  if (loading) {
    return (
      <div className="create-dish-container">
        <div className="loading-container">
          <p>Cargando plato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-dish-container">
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
      <h1 className="page-title">Modificar Plato</h1>

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
            {imageFile ? "Cambiar Imagen" : "Actualizar Imagen"}
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
          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="credits" className="form-label">
                Precio (Yameats)
              </label>
              <input
                id="credits"
                name="credits"
                type="number"
                className="form-input"
                placeholder="0"
                value={dishData.credits}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
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

          {/* Botón actualizar */}
          <button className="btn-create-dish" onClick={handleUpdateDish} disabled={loading}>
            {loading ? "Actualizando..." : "Guardar Cambios"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ModDish;
