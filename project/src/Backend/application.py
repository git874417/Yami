from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from Entregas.Practica3.sources.scripts.restaurant import restaurantDAO
from project.db_utils.userDAO import userDAO
from project.db_utils.clientDAO import clientDAO
from project.db_utils.dishDAO import dishDAO
from project.src.Backend import services
from project.src.Backend.model import *

app = FastAPI(
    title="Yami API",
    description="La API para la aplicación Yami.",
    version="1.0.0"
)

# --- CORS Middleware ---
# Permite que tu frontend se conecte a esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambia "*" por el dominio de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints de la API ---

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Yami"}

@app.post("/api/create_client", status_code=201)
def create_client_endpoint(client: ClientCreate):
    """
    Crea un nuevo cliente en la base de datos.
    """
    try:
        client_id = services.create_new_client(client)
        if client_id is None:
            raise HTTPException(status_code=400, detail="No se pudo crear el cliente.")
            
        return {"message": "Cliente creado exitosamente", "client_id": client_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.post("/api/update_client/{id}", status_code=200)
def update_client_endpoint(id: int, client: ClientUpdate):
    """
    Actualiza un cliente en la base de datos.
    """
    try:
        client_id = services.update_existing_client(id, client)
        if client_id is None:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el cliente.")

        return {"message": "Cliente actualizado exitosamente", "client_id": client_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.delete("/api/delete_client/{id}", status_code=200)
def delete_client_endpoint(id: int):
    """
    Elimina un cliente de la base de datos.
    """
    try:
        success = services.delete_existing_client(id)
        if not success:
            raise HTTPException(status_code=404, detail="No se pudo eliminar el cliente. Cliente no encontrado.")
            
        return {"message": "Cliente eliminado exitosamente", "client_id": id}
    except HTTPException:
        # Re-lanza las HTTPException tal cual
        raise
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.post("/api/create_restaurant", status_code=201)
def create_restaurant_endpoint(restaurant: RestaurantCreate):
    """
    Crea un nuevo restaurante en la base de datos.
    """
    try:
        restaurant_id = services.create_new_restaurant(restaurant)
        if restaurant_id is None:
            raise HTTPException(status_code=400, detail="No se pudo crear el restaurante.")
            
        return {"message": "restaurante creado exitosamente", "restaurant_id": restaurant_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.post("/api/update_restaurant/{id}", status_code=200)
def update_restaurant_endpoint(id: int, restaurant: RestaurantUpdate):
    """
    Actualiza un restaurante en la base de datos.
    """
    try:
        restaurant_id = services.update_existing_restaurant(id, restaurant)
        if restaurant_id is None:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el restaurante.")

        return {"message": "restaurante actualizado exitosamente", "restaurant_id": restaurant_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.delete("/api/delete_restaurant/{id}", status_code=200)
def delete_restaurant_endpoint(id: int):
    """
    Elimina un restaurante y todos sus datos asociados de la base de datos.
    Esto incluye: platos, pedidos, platos pedidos y valoraciones.
    """
    try:
        success = services.delete_existing_restaurant(id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="No se pudo eliminar el restaurante. Restaurante no encontrado."
            )
            
        return {
            "message": "Restaurante y todos sus datos asociados eliminados exitosamente",
            "restaurant_id": id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.post("/api/create_dish/{restaurant_id}", status_code=201)
def create_dish_endpoint(restaurant_id: int, dish: DishCreate):
    """
    Crea un nuevo plato en la base de datos.
    """
    try:
        dish_id = services.create_new_dish(restaurant_id, dish)
        if dish_id is None:
            raise HTTPException(status_code=400, detail="No se pudo crear el plato.")
            
        return {"message": "plato creado exitosamente", "dish_id": dish_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.post("/api/update_dish/{dish_id}", status_code=200)
def update_dish_endpoint(dish_id: int, dish: DishUpdate):
    """
    Actualiza un plato en la base de datos.
    """
    try:
        dish_id = services.update_existing_dish(dish_id, dish)
        if dish_id is None:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el plato.")

        return {"message": "plato actualizado exitosamente", "dish_id": dish_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.delete("/api/delete_dish/{id}", status_code=200)
def delete_dish_endpoint(id: int):
    """
    Elimina un plato de la base de datos.
    """
    try:
        success = services.delete_existing_dish(id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="No se pudo eliminar el plato. Plato no encontrado."
            )
            
        return {
            "message": "Plato eliminado exitosamente",
            "dish_id": id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.get("/api/users")
def get_all_users():
    """
    Obtiene una lista de todos los usuarios.
    """
    try:
        dao = userDAO()
        users = dao.get_all()
        # Convertir los VOs a diccionarios para la respuesta JSON
        users_list = [{"id": user.id, "email": user.email, "role": user.role} for user in users]
        return {"users": users_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.get("/api/clients")
def get_all_clients():
    """
    Obtiene una lista de todos los clientes.
    """
    try:
        dao = clientDAO()
        clients = dao.get_all()
        # Convertir los VOs a diccionarios para la respuesta JSON
        clients_list = [
            {
            "id": client.id,
            "user_id": client.user_id,
            "sub_plan": client.sub_plan,
            "name": client.name,
            "surname": client.surname,
            "address": client.address,
            "city": client.city,
            "postal_code": client.postal_code,
            "dni": client.dni,
            "phone_number": client.phone_number,
            "available_credits": client.available_credits
            } for client in clients
        ]
        return {"clients": clients_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.get("/api/restaurants")
def get_all_restaurants():
    """
    Obtiene una lista de todos los restaurantes.
    """
    try:
        dao = restaurantDAO()
        restaurants = dao.get_all()
        # Convertir los VOs a diccionarios para la respuesta JSON
        restaurants_list = [
            {
            "id": restaurant.id,
            "user_id": restaurant.user_id,
            "name": restaurant.name,
            "description": restaurant.description,
            "city": restaurant.city,
            "address": restaurant.address,
            "phone_number": restaurant.phone_number,
            "category": restaurant.category
            } for restaurant in restaurants
        ]
        return {"restaurants": restaurants_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.get("/api/dish/{restaurant_id}")
def get_all_dishes(restaurant_id: int):
    """
    Obtiene una lista de todos los platos de un restaurante.
    """
    try:
        dao = dishDAO()
        dishes = dao.get_all_from_restaurant(restaurant_id)
        # Convertir los VOs a diccionarios para la respuesta JSON
        dish_list = [
            {
            "id": dish.id,
            "restaurant_id": dish.restaurant_id,
            "name": dish.name,
            "description": dish.description,
            "allergens": dish.allergens,
            "dish_type": dish.dish_type
            } for dish in dishes
        ]
        return {"restaurants": dish_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

# Para ejecutar la app, usa el comando:
# uvicorn project.src.Backend.application:app --reload
