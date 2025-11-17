import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import "../css/UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();
  const { showModal } = useModal();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const role = sessionStorage.getItem("role");
    const role_id = sessionStorage.getItem("role_id");
    const profilePic = sessionStorage.getItem("profile_picture");

    if (!userId) {
      navigate("/inicio-sesion");
      return;
    }

    setProfilePicture(profilePic);
    fetchUserData(role_id, userId,  role);
  }, [navigate]);

  const fetchUserData = async (role_id, user_id, role) => {
    try {
      setLoading(true);
      // Fetch user details from API based on role
      const endpointRole = role === "Client" ? `/api/client/${role_id}` : `/api/restaurant/${role_id}`;
      const endpointUser = `/api/user/${user_id}`;
      const responseRole = await fetch(`${API_BASE}${endpointRole}`);
      const responseUser = await fetch(`${API_BASE}${endpointUser}`);
      
      if (!responseRole.ok) {
        throw new Error(`Error: ${responseRole.status}`);
      }
      if (!responseUser.ok) {
        throw new Error(`Error: ${responseUser.status}`);
      }
      
      const dataRole = await responseRole.json();
      const dataUser = await responseUser.json();
      const combinedData = { ...dataRole, ...dataUser, role };
      setUser(combinedData);
      setEditedData(combinedData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);

  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(user);
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
  };

  const handleInputChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const handleSave = async () => {
    // Validate password change if applicable
    if (isChangingPassword) {
      if (!newPassword || !confirmPassword) {
        showModal("Error", "Por favor completa ambos campos de contraseña");
        return;
      }
      if (newPassword !== confirmPassword) {
        showModal("Error", "Las contraseñas no coinciden");
        return;
      }
      if (newPassword.length < 6) {
        showModal("Error", "La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    try {
      const userId = sessionStorage.getItem("user_id");
      const role = sessionStorage.getItem("role");
      const role_id = sessionStorage.getItem("role_id");

      // Update password if needed
      if (isChangingPassword) {
        const userUpdateData = {
          password: newPassword,
        };

        const userResponse = await fetch(`${API_BASE}/api/update_user/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userUpdateData),
        });

        if (!userResponse.ok) {
          throw new Error("Error al actualizar contraseña");
        }
      }

      // Update role-specific data
      if (role === "Client") {
        const clientUpdateData = {
          sub_plan: editedData.sub_plan || "",
          name: editedData.name || "",
          surname: editedData.surname || "",
          address: editedData.address || "",
          city: editedData.city || "",
          postal_code: editedData.postal_code || "",
          dni: editedData.dni || "",
          phone_number: editedData.phone_number || "",
        };

        const clientResponse = await fetch(`${API_BASE}/api/update_client/${role_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientUpdateData),
        });

        if (!clientResponse.ok) {
          throw new Error("Error al actualizar datos del cliente");
        }
      } else {
        const restaurantUpdateData = {
          name: editedData.name || "",
          description: editedData.description || "",
          city: editedData.city || "",
          address: editedData.address || "",
          phone_number: editedData.phone_number || "",
          category: editedData.category || "",
        };

        const restaurantResponse = await fetch(`${API_BASE}/api/update_restaurant/${role_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(restaurantUpdateData),
        });

        if (!restaurantResponse.ok) {
          throw new Error("Error al actualizar datos del restaurante");
        }
      }

      // Success
      showModal("Éxito", "Datos actualizados correctamente");
      setUser(editedData);
      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);

    } catch (error) {
      console.error("Error updating user data:", error);
      showModal("Error", "No se pudieron actualizar los datos: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p className="loading-message">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-picture-large">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/6.x/initials/svg?seed=${user?.id || 'U'}`;
                }}
              />
            ) : (
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.id || 'U'}`}
                alt="Profile"
              />
            )}
          </div>
          <h1 className="profile-name">{user?.name || "Usuario"}</h1>
          <p className="profile-role">{user?.role === "Client" ? "Cliente" : "Restaurante"}</p>
        </div>

        <div className="profile-info">
          <h2>Información del Perfil</h2>
          <div className="info-grid">

            <div className="info-item">
              <label>Email:</label>
              <span className="non-editable">{user?.email || "No disponible"}</span>
            </div>

            <div className="info-item">
              <label>Teléfono:</label>
              <span className="non-editable">{user?.phone_number || "No disponible"}</span>
            </div>

            <div className="info-item">
              <label>Contraseña:</label>
              {isEditing ? (
                <div className="password-edit-section">
                  <button 
                    className="btn-change-password"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                  >
                    {isChangingPassword ? "Cancelar cambio" : "Cambiar contraseña"}
                  </button>
                  {isChangingPassword && (
                    <div className="password-inputs">
                      <input
                        type="password"
                        className="edit-input"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <input
                        type="password"
                        className="edit-input"
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <span>••••••••</span>
              )}
            </div>

            <div className="info-item">
              <label>Nombre:</label>
              {isEditing ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editedData?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              ) : (
                <span>{user?.name || "No disponible"}</span>
              )}
            </div>
            {user?.role === "Client" && (
              <>
                <div className="info-item">
                  <label>Apellido:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.surname || ""}
                      onChange={(e) => handleInputChange("surname", e.target.value)}
                    />
                  ) : (
                    <span>{user?.surname || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>DNI:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.dni || ""}
                      onChange={(e) => handleInputChange("dni", e.target.value)}
                    />
                  ) : (
                    <span>{user?.dni || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Dirección:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  ) : (
                    <span>{user?.address || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Ciudad:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.city || ""}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  ) : (
                    <span>{user?.city || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Código Postal:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.postal_code || ""}
                      onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    />
                  ) : (
                    <span>{user?.postal_code || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Plan de Suscripción:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.sub_plan || ""}
                      onChange={(e) => handleInputChange("sub_plan", e.target.value)}
                    />
                  ) : (
                    <span>{user?.sub_plan || "No disponible"}</span>
                  )}
                </div>
              </>
            )}

            {user?.role === "Restaurant" && (
              <>
                <div className="info-item">
                  <label>Descripción:</label>
                  {isEditing ? (
                    <textarea
                      className="edit-input"
                      rows="3"
                      value={editedData?.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  ) : (
                    <span>{user?.description || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Categoría:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.category || ""}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                    />
                  ) : (
                    <span>{user?.category || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Dirección:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  ) : (
                    <span>{user?.address || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Ciudad:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editedData?.city || ""}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  ) : (
                    <span>{user?.city || "No disponible"}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>Valoración:</label>
                  <span className="non-editable">⭐ {user?.rating || "Sin valoraciones"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn-save" onClick={handleSave}>
                Guardar Cambios
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button className="btn-edit" onClick={handleEdit}>
                Editar Perfil
              </button>
              <button className="btn-back" onClick={() => navigate(-1)}>
                Volver
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
