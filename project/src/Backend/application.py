import sys
import os


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# --- Static Files ---
# Monta la carpeta ProfileImages para servir las imágenes de perfil
profile_images_path = os.path.join(os.path.dirname(__file__), "ProfileImages")
app.mount("/ProfileImages", StaticFiles(directory=profile_images_path), name="profile_images")

# --- Endpoints de la API ---

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Yami"}

@app.post("/api/login")
def login_endpoint(form_data: UserLogin):
    """
    Autentica a un usuario.
    """
    try:
        user_dao = userDAO()
        
        user = user_dao.get_by_email(form_data.email)
        
        
        if not user or not services.verify_password(form_data.password, user.password):
            raise HTTPException(
                status_code=401,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if user.role == "Restaurant":
            restaurant_dao = restaurantDAO()
            restaurant = restaurant_dao.get_by_user_id(user.id)
            if not restaurant:
                raise HTTPException(
                    status_code=404,
                    detail="Restaurante no encontrado para el usuario dado",
                )
            return {"message": "Login exitoso", "user_id": user.id, "role": user.role, "role_id": restaurant.id, "profile_picture": user.image_url}
        
        elif user.role == "Client":
            client_dao = clientDAO()
            client = client_dao.get_by_user_id(user.id)
            if not client:
                raise HTTPException(
                    status_code=404,
                    detail="Cliente no encontrado para el usuario dado",
                )
            return {"message": "Login exitoso", "user_id": user.id, "role": user.role, "role_id": client.id, "profile_picture": user.image_url}

    except HTTPException:
        
        raise
    except Exception as e:
        
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor durante el login: {e}"
        )

@app.post("/api/create_client", status_code=201)
def create_client_endpoint(client: ClientCreate):
    """
    Crea un nuevo cliente en la base de datos.
    """
    try:
        client_id, user_id, profile_picture = services.create_new_client(client)
        if client_id is None:
            raise HTTPException(status_code=400, detail="No se pudo crear el cliente.")
            
        return {"message": "Cliente creado exitosamente", "client_id": client_id, "user_id": user_id, "profile_picture": profile_picture}
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

    print("--- INICIO: Payload de Pedido Recibido ---")
    print(f"Cliente ID: {client_id}, Restaurante ID: {restaurant_id}")
    print("Cuerpo del pedido (JSON):")
    # Usamos model_dump_json para una impresión bonita del modelo Pydantic
    print(order.model_dump_json(indent=2))
    print("--- FIN: Payload de Pedido Recibido ---")

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
    
    
@app.patch("/api/update_user/{user_id}", status_code=200)
def update_user_endpoint(user_id: int, user: UserUpdate):
    """
    Actualiza un usuario en la base de datos.
    """
    try:
        updated_user_id = services.update_existing_user(user_id, user)
        if updated_user_id is None:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el usuario.")

        return {"message": "Usuario actualizado exitosamente", "user_id": updated_user_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
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
    
@app.get("/api/user/{user_id}")
def get_user_by_id(user_id: int):
    """
    Obtiene un usuario específico por su ID.
    """
    try:
        dao = userDAO()
        user = dao.get_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "image_url": user.image_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.get("/api/client/{client_id}")
def get_client_by_id(client_id: int):
    """
    Obtiene un cliente específico por su ID.
    """
    try:
        dao = clientDAO()
        client = dao.get_by_id(client_id)
        
        if not client:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        return {
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
            "available_credits": client.available_credits,
        }
    except HTTPException:
        raise
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

@app.get("/restaurants/name/{restaurant_name}")
def get_restaurant_by_name(restaurant_name: str):
    """
    Obtiene un restaurante específico por su nombre.
    """
    try:
        restaurant_dao = restaurantDAO()
        restaurant = restaurant_dao.get_by_name(restaurant_name)
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante no encontrado")
        
        rating = 0.0
        try:
            # Obtener el rating promedio
            from project.db_utils.ratingDAO import ratingDAO
            rating_dao = ratingDAO()
            avg_rating = rating_dao.get_average_rating_by_restaurant(restaurant.id)
            rating = avg_rating
        except Exception as rating_error:
            print(f"Error obteniendo rating: {rating_error}")
        
        return {
            "id": restaurant.id,
            "user_id": restaurant.user_id,
            "name": restaurant.name,
            "description": restaurant.description,
            "city": restaurant.city,
            "address": restaurant.address,
            "phone_number": restaurant.phone_number,
            "category": restaurant.category,
            "image_url": restaurant.logo_url if restaurant.logo_url else None,
            "rating": rating
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting restaurant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.get("/api/restaurant/{restaurant_id}")
def get_restaurant_by_id(restaurant_id: int):
    """
    Obtiene un restaurante específico por su ID.
    """
    try:
        dao = restaurantDAO()
        restaurant = dao.get_by_id(restaurant_id)
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante no encontrado")
        
        return {
            "id": restaurant.id,
            "user_id": restaurant.user_id,
            "name": restaurant.name,
            "description": restaurant.description,
            "city": restaurant.city,
            "address": restaurant.address,
            "phone_number": restaurant.phone_number,
            "category": restaurant.category,
            "image_url": restaurant.logo_url if restaurant.logo_url else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}") 

@app.get("/api/restaurants")
def get_all_restaurants():
    """
    Obtiene una lista de todos los restaurantes con sus ratings promedio.
    """
    try:
        from project.db_utils.ratingDAO import ratingDAO
        
        restaurant_dao = restaurantDAO()
        rating_dao = ratingDAO()
        restaurants = restaurant_dao.get_all()
        
        # Convertir los VOs a diccionarios y añadir el rating promedio
        restaurants_list = []
        for restaurant in restaurants:
            try:
                avg_rating = rating_dao.get_average_rating_by_restaurant(restaurant.id)
            except Exception as rating_error:
                print(f"Error obteniendo rating para restaurante {restaurant.id}: {rating_error}")
                avg_rating = 0.0
            
            restaurants_list.append({
                "id": restaurant.id,
                "user_id": restaurant.user_id,
                "name": restaurant.name,
                "description": restaurant.description,
                "city": restaurant.city,
                "address": restaurant.address,
                "phone_number": restaurant.phone_number,
                "category": restaurant.category,
                "image_url": restaurant.logo_url if restaurant.logo_url else None,
                "rating": avg_rating
            })
        
        return {"restaurants": restaurants_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.get("/restaurants/name/{restaurant_name}/dishes")
def get_dishes_by_restaurant_name(restaurant_name: str):
    """
    Obtiene una lista de todos los platos de un restaurante por su nombre.
    """
    try:
        restaurant_dao = restaurantDAO()
        restaurant = restaurant_dao.get_by_name(restaurant_name)
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante no encontrado")
        
        dish_dao = dishDAO()
        dishes = dish_dao.get_all_from_restaurant(restaurant.id)
        
        # Convertir los VOs a diccionarios para la respuesta JSON
        return [
            {
                "id": dish.id,
                "name": dish.name,
                "description": dish.description,
                "allergens": dish.allergens,
                "dish_type": dish.dish_type,
                "credits": dish_dao.get_dish_credits(dish.id),
                "image_url": dish.image_url if dish.image_url else None
            } for dish in dishes
        ]
    except HTTPException:
        raise
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
            "dish_type": dish.dish_type,
            "image_url": dish.image_url if dish.image_url else None
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
                "order_credits": order.order_credits,
                "order_status": order.order_status
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
                "order_credits": order.order_credits,
                "order_status": order.order_status
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