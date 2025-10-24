from .clientVO import *
from .clientDAO import *
from .dishVO import *
from .dishDAO import *
from .orderedDishVO import *
from .orderedDishDAO import *
from .orderVO import *
from .orderDAO import *
from .ratingVO import *
from .ratingDAO import *
from .restaurantVO import *
from .restaurantDAO import *    
from .userVO import *
from .userDAO import *
from .subscriptionPlanVO import *
from .subscriptionPlanDAO import *
from .dishTypeVO import *  
from .dishTypeDAO import *


def create_client(email: str, password: str, sub_plan: str, name: str, surname: str, 
                  address: str, city: str, postal_code: str, dni: str, phone_number: str):
    
    try:    
        user_dao = userDAO()
        client_dao = clientDAO()
        subscription_plans = subscriptionPlanDAO()
        
        # Create user
        user_vo = userVO(email=email, password=password, role="Client")
        _, user_id = user_dao.insert(user_vo)

        # Get subscription plan details
        available_credits = subscription_plans.get_by_plan_credits(sub_plan)

        # Create client profile
        client_vo = clientVO(
            user_id=user_id,
            sub_plan=sub_plan,
            name=name,
            surname=surname,
            address=address,
            city=city,
            postal_code=postal_code,
            dni=dni,
            phone_number=phone_number,
            available_credits=available_credits
        )
        _, client_id = client_dao.insert(client_vo)
        print(f"Client created with ID: {client_id}")
        return client_id
    except Exception as e:
        print(f"Error creating client: {e}")

def update_client_credits(id: int, force_update: bool = False):
    try:
        client_dao = clientDAO()

        updated_client = client_dao.update_credits(id, force_update=force_update)
        return updated_client
    except Exception as e:
        print(f"Error updating client credits: {e}")
    return

def update_client_information(id: int, data_to_update: dict):
    """
    Actualiza la información de un cliente en la base de datos.
    """
    if not data_to_update:
        # No hay nada que actualizar, simplemente retornamos el ID.
        print(f"No data provided to update for client ID: {id}")
        return id

    try:
        client_dao = clientDAO()
        # Asumimos que el método update del DAO ahora acepta un diccionario.
        updated_client = client_dao.update(id, data_to_update)
        
        print(f"Client information updated: {updated_client}")      
        return updated_client
    except Exception as e:
        print(f"Error updating client information: {e}")
        raise

def create_restaurant(email: str, password: str, name: str, description: str, city: str, 
                      address: str, phone_number: str, category: str):
    try:
        user_dao = userDAO()
        restaurant_dao = restaurantDAO()
        
        # Create user
        user_vo = userVO(email=email, password=password, role="Restaurant")
        _, user_id = user_dao.insert(user_vo)

        # Create restaurant profile
        restaurant_vo = restaurantVO(
            user_id=user_id,
            name=name,
            description=description,
            city=city,
            address=address,
            phone_number=phone_number,
            category=category
        )
        _, restaurant_id = restaurant_dao.insert(restaurant_vo)
        print(f"Restaurant created with ID: {restaurant_id}")
        return restaurant_id
    except Exception as e:
        print(f"Error creating restaurant: {e}")
    return

def update_restaurant_information(id:int, email: str = None, new_name: str = None, new_description: str = None, new_city: str = None, new_address: str = None, new_phone_number: str = None, new_category: str = None):
    try:        
        restaurant_dao = restaurantDAO()

        updated_restaurant = restaurant_dao.update(
            id,
            new_name=new_name,
            new_description=new_description,
            new_city=new_city,
            new_address=new_address,
            new_phone_number=new_phone_number,
            new_category=new_category
        )
        print(f"Restaurant information updated: {updated_restaurant}")
        return updated_restaurant
    except Exception as e:
        print(f"Error updating restaurant information: {e}")

def create_dish(restaurant_id: int, name: str, description: str, allergens: str, dish_type: str):
    try:
        dish_dao = dishDAO()
        
        # Create dish
        dish_vo = dishVO(
            restaurant_id=restaurant_id,
            name=name,
            description=description,
            allergens=allergens,
            dish_type=dish_type
        )
        _, dish_id = dish_dao.insert(dish_vo)
        print(f"Dish created with ID: {dish_id}")
        return dish_id
    except Exception as e:
        print(f"Error creating dish: {e}")
    return

def update_dish_information(old_dish_name: str, restaurant_id: int, new_name: str = None, new_description: str= None, new_allergens: str= None, new_dish_type: str= None):
    try:        
        dish_dao = dishDAO()

        dish = dish_dao.get_by_name(old_dish_name, restaurant_id)
        updated_dish = dish_dao.update(
            dish.id,
            new_name=new_name,
            new_description=new_description,
            new_allergens=new_allergens,
            new_dish_type=new_dish_type
        )
        print(f"Dish information updated: {updated_dish}")
        return updated_dish
    except Exception as e:
        print(f"Error updating dish information: {e}")
    return

def create_order(client_id: int, restaurant_id: int, dishes: list[dict]):
    try:
        order_dao = orderDAO()
        dish_dao = dishDAO()
        ordered_dish_dao = orderedDishDAO()
        client_dao = clientDAO()
        dishType_dao = dishTypeDAO()

        order_credits = 0
    
        for dish in dishes:
            order_credits += dishType_dao.get_credits_by_name(dish["dish_type"])  
            
        print(f"Total order credits: {order_credits}")

        client_dao.update_credits_after_order(client_id, order_credits)

        # Create order
        order_vo = orderVO(
            client_id=client_id,
            restaurant_id=restaurant_id,
            order_credits=order_credits
        )
        _, order_id = order_dao.insert(order_vo)

        for item in dishes:           
            dish = dish_dao.get_by_name(item['dish_name'], restaurant_id)
            ordered_dish_vo = orderedDishVO(
                order_id=order_id,
                dish_id=dish.id,
                dish_name=item['dish_name'],
                instructions=item['instructions'],
            )
            _, _ = ordered_dish_dao.insert(ordered_dish_vo)
        print(f"Order created with ID: {order_id}") 
        return order_id
    except Exception as e:
        print(f"Error creating order: {e}")
    return          

def create_rating(client_id: int, restaurant_id: int, rating: int):
    try:
        rating_dao = ratingDAO()
        
        # Create rating
        rating_vo = ratingVO(
            client_id=client_id,
            restaurant_id=restaurant_id,
            rating=rating
        )
        _, rating_id = rating_dao.insert(rating_vo)
        print(f"Rating created with ID: {rating_id}")
        return rating_id
    except Exception as e:
        print(f"Error creating rating: {e}")
    return

def clean_db():
    """
    Limpia toda la base de datos eliminando todos los registros
    excepto los planes de suscripción.
    Orden de eliminación: OrderedDishes -> Orders -> Ratings -> Dishes -> Restaurants -> Clients -> Users
    """
    try:
        print("Iniciando limpieza de la base de datos...")
        
        # 1. Eliminar platos pedidos (OrderedDishes)
        ordered_dish_dao = orderedDishDAO()
        ordered_dish_dao.delete_all()
        print("✓ OrderedDishes eliminados")
        
        # 2. Eliminar pedidos (Orders)
        order_dao = orderDAO()
        order_dao.delete_all()
        print("✓ Orders eliminados")
        
        # 3. Eliminar valoraciones (Ratings)
        rating_dao = ratingDAO()
        rating_dao.delete_all()
        print("✓ Ratings eliminados")
        
        # 4. Eliminar platos (Dishes)
        dish_dao = dishDAO()
        dish_dao.delete_all()
        print("✓ Dishes eliminados")
        
        # 5. Eliminar restaurantes (Restaurants)
        restaurant_dao = restaurantDAO()
        restaurant_dao.delete_all()
        print("✓ Restaurants eliminados")
        
        # 6. Eliminar clientes (Clients)
        client_dao = clientDAO()
        client_dao.delete_all()
        print("✓ Clients eliminados")
        
        # 7. Eliminar usuarios (Users)
        user_dao = userDAO()
        user_dao.delete_all_clients()
        user_dao.delete_all_restaurants()
        print("✓ Users eliminados")
        
        print("\n✅ Base de datos limpiada exitosamente (SubscriptionPlans y Admins preservados)")
        
    except Exception as e:
        print(f"✗ Error limpiando la base de datos: {e}")
        return False
    
    return True