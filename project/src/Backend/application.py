import sys
import os

# --- INICIO DE LA SOLUCIÓN ---
# Añade la carpeta raíz del proyecto (Yammi) a la ruta de búsqueda de Python
# para que los imports como "from project..." funcionen al dar "Play".
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
# --- FIN DE LA SOLUCIÓN ---

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from project.db_utils.restaurantDAO import restaurantDAO
from project.db_utils.userDAO import userDAO
from project.db_utils.clientDAO import clientDAO
from project.db_utils.dishDAO import dishDAO
from project.db_utils.orderDAO import orderDAO
from project.db_utils.orderedDishDAO import orderedDishDAO
from project.src.Backend import services
from project.src.Backend.model import *
import uvicorn

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

@app.post("/api/login")
def login_endpoint(form_data: UserLogin):
    """
    Autentica a un usuario.
    """
    user_dao = userDAO()
    # 1. Buscar al usuario por su email
    user = user_dao.get_by_email(form_data.email)
    
    # 2. Si el usuario no existe o la contraseña es incorrecta, devolver un error
    #    Se usa una función de verificación segura para evitar "timing attacks"
    if not user or not services.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Si la autenticación es exitosa, puedes generar un token JWT (no incluido aquí)
    #    y devolverlo al cliente.
    return {"message": "Login exitoso", "user_id": user.id, "role": user.role}

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
    
@app.post("/api/create_order/{client_id}/{restaurant_id}", status_code=201)
def create_order_endpoint(client_id: int, restaurant_id: int, order: OrderCreate):
    """
    Crea un nuevo pedido en la base de datos.
    
    Validaciones:
    - El cliente debe existir
    - El restaurante debe existir
    - Todos los platos deben existir en ese restaurante
    - El cliente debe tener suficientes créditos
    
    Los créditos se calculan automáticamente según el tipo de plato:
    - Entrante: X créditos
    - Principal: Y créditos
    - Postre: Z créditos
    """
    try:
        # Validar que la lista de platos no esté vacía
        if not order.dishes or len(order.dishes) == 0:
            raise HTTPException(
                status_code=400,
                detail="El pedido debe contener al menos un plato"
            )
        
        # Crear el pedido
        order_id = services.create_new_order(client_id, restaurant_id, order)

        return {
            "message": "Pedido creado exitosamente",
            "order_id": order_id
        }
        
    except ValueError as ve:
        # Errores de validación (ej. créditos insuficientes)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Otros errores
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {e}"
        )
    

@app.post("/api/create_rating/{client_id}/{restaurant_id}", status_code=201)
def create_rating_endpoint(client_id: int, restaurant_id: int, rating: RatingCreate):
    """
    Crea una nueva valoración para un restaurante por parte de un cliente.
    """
    try:
        rating_id = services.create_new_rating(client_id, restaurant_id, rating)
        if rating_id is None:
            raise HTTPException(status_code=400, detail="No se pudo crear la valoración.")
            
        return {"message": "Valoración creada exitosamente", "rating_id": rating_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.patch("/api/update_client/{id}", status_code=200)
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
    
@app.patch("/api/update_restaurant/{id}", status_code=200)
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

@app.patch("/api/update_dish/{dish_id}", status_code=200)
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

@app.patch("/api/update_order_status/{order_id}", status_code=200)
def update_order_status_endpoint(order_id: int):
    """
    Actualiza un pedido en la base de datos.
    """
    try:
        order_id = services.update_existing_order_status(order_id)
        if order_id is None:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el pedido.")

        return {"message": "pedido actualizado exitosamente", "order_id": order_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.patch("/api/update_rating/{rating_id}", status_code=200)
def update_rating_endpoint(rating_id: int, rating: RatingUpdate):
    """
    Actualiza una valoración en la base de datos.
    """
    try:
        rating_id = services.update_existing_rating(rating_id, rating)
        if rating_id is None:
            raise HTTPException(status_code=400, detail="No se pudo actualizar la valoración.")

        return {"message": "Valoración actualizada exitosamente", "rating_id": rating_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.patch("/api/cancel_order/{order_id}", status_code=200)
def cancel_order_endpoint(order_id: int):
    """
    Cancela un pedido en la base de datos.
    """
    try:
        order_id = services.cancel_existing_order(order_id)
        if order_id is None:
            raise HTTPException(status_code=400, detail="No se pudo cancelar el pedido.")

        return {"message": "pedido cancelado exitosamente", "order_id": order_id}
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
    
@app.put("/api/upload/profile_picture/{user_id}", status_code=200)
async def upload_profile_picture_endpoint(user_id: int, file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Tipo de archivo no válido. Solo .jpg o .png")
    
    try:
        file_content = await file.read()
        image_url = services.upload_user_profile_picture(user_id, file_content, file.content_type)
        return {"message": "Foto de perfil subida exitosamente", "image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.put("/api/upload/restaurant_image/{restaurant_id}", status_code=200)
async def upload_restaurant_image(restaurant_id: int, file: UploadFile = File(...)):
    """
    Sube o actualiza la imagen de un restaurante.
    """
    try:
        # 1. Validar el tipo de archivo (opcional pero recomendado)
        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Tipo de archivo no válido. Solo se permiten .jpg o .png")

        file_content = await file.read()
        # 2. Llamar al servicio para que suba el archivo
        image_url = services.upload_restaurant_logo(
            restaurant_id=restaurant_id,
            file=file_content,
            content_type=file.content_type
        )

        if not image_url:
            raise HTTPException(status_code=500, detail="No se pudo subir la imagen.")

        return {"message": "Imagen subida exitosamente", "image_url": image_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.put("/api/upload/dish_image/{dish_id}", status_code=200)
async def upload_dish_image_endpoint(dish_id: int, file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Tipo de archivo no válido. Solo .jpg o .png")
    
    try:
        file_content = await file.read()
        image_url = services.upload_dish_image(dish_id, file_content, file.content_type)
        return {"message": "Imagen del plato subida exitosamente", "image_url": image_url}
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

@app.get("/api/dishes/{restaurant_id}")
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
        return {"dishes": dish_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.get("/api/dish/{dish_id}")
def get_dish_by_id(dish_id: int):
    """
    Obtiene un plato específico por su ID.
    """
    try:
        dao = dishDAO()
        dish = dao.get_by_id(dish_id)
        
        if not dish:
            raise HTTPException(status_code=404, detail="Plato no encontrado")
        
        # Calcular los créditos del plato
        credits = dao.get_dish_credits(dish_id)
        
        return {
            "id": dish.id,
            "restaurant_id": dish.restaurant_id,
            "name": dish.name,
            "description": dish.description,
            "allergens": dish.allergens,
            "dish_type": dish.dish_type,
            "credits": credits,
            "image": dish.image_url if dish.image_url else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")


@app.get("/api/client_orders/{client_id}", status_code=200)
def get_client_orders(client_id: int):
    """
    Obtiene todos los pedidos de un cliente específico.
    """
    try:
        
        order_dao = orderDAO()
        orders = order_dao.get_by_client_id(client_id)
        
        # Convertir a diccionarios para la respuesta JSON
        orders_list = []
        for order in orders:
            orders_list.append({
                "id": order.id,
                "client_id": order.client_id,
                "restaurant_id": order.restaurant_id,
                "order_credits": order.order_credits
            })
        
        return {
            "client_id": client_id,
            "total_orders": len(orders_list),
            "orders": orders_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo pedidos: {e}"
        )

@app.get("/api/restaurant_orders/{restaurant_id}", status_code=200)
def get_restaurant_orders(restaurant_id: int):
    """
    Obtiene todos los pedidos de un restaurante específico.
    """
    try:
        
        order_dao = orderDAO()
        orders = order_dao.get_by_restaurant_id(restaurant_id)
        
        # Convertir a diccionarios para la respuesta JSON
        orders_list = []
        for order in orders:
            orders_list.append({
                "id": order.id,
                "client_id": order.client_id,
                "restaurant_id": order.restaurant_id,
                "order_credits": order.order_credits
            })
        
        return {
            "restaurant_id": restaurant_id,
            "total_orders": len(orders_list),
            "orders": orders_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo pedidos: {e}"
        )


@app.get("/api/order/{order_id}/details", status_code=200)
def get_order_details(order_id: int):
    """
    Obtiene los detalles completos de un pedido incluyendo los platos.
    """
    try:
        
        order_dao = orderDAO()
        ordered_dish_dao = orderedDishDAO()
        
        # Obtener el pedido
        order = order_dao.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
        # Obtener los platos del pedido
        ordered_dishes = ordered_dish_dao.get_by_order_id(order_id)
        
        # Convertir platos a diccionarios
        dishes_list = []
        for dish in ordered_dishes:
            dishes_list.append({
                "dish_id": dish.dish_id,
                "dish_name": dish.dish_name,
                "instructions": dish.instructions
            })
        
        return {
            "order_id": order.id,
            "client_id": order.client_id,
            "restaurant_id": order.restaurant_id,
            "order_credits": order.order_credits,
            "dishes": dishes_list
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo detalles del pedido: {e}"
        )
    
# Para ejecutar la app, usa el comando:
# uvicorn project.src.Backend.application:app --reload
if __name__ == "__main__":
    # Esto permite ejecutar la app con el botón "Play"
    uvicorn.run("project.src.Backend.application:app", host="127.0.0.1", port=8000, reload=True)