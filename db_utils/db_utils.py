from client import *
from dish import *
from orderedDish import *
from order import *
from rating import *
from restaurant import *
from user import *
from subscriptionPlan import *

def create_client(email: str, password: str, role: int, sub_plan: str, name: int, surname: int, 
                  address: str, city: str, postal_code: str, dni: str, phone_number: str):
    
    try:    
        user_dao = userDAO()
        client_dao = clientDAO()
        subscription_plans = subscriptionPlanDAO()
        
        # Create user
        user_vo = userVO(email=email, password=password, role=role)
        _, user_id = user_dao.insert(user_vo)

        # Get subscription plan details
        available_credits = subscription_plans.get_by_id(sub_plan).credits

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
        _ = client_dao.insert(client_vo)
    except Exception as e:
        print(f"Error creating client: {e}")
    return 

def update_client_credits(email: str):
    try:
        client_dao = clientDAO()
        user_dao = userDAO()

        user = user_dao.get_by_email(email)
        updated_client = client_dao.update_credits(user.id)
        return updated_client
    except Exception as e:
        print(f"Error updating client credits: {e}")
    return

def update_client_information(email: str, new_sub_plan: str = None, new_name: str = None, new_surname: str = None,
                              new_address: str = None, new_city: str = None, new_postal_code: str = None, new_dni: str = None, new_phone_number: str = None):
    try:
        client_dao = clientDAO()
        user_dao = userDAO()

        user = user_dao.get_by_email(email)
        updated_client = client_dao.update(
            user.id,
            new_sub_plan=new_sub_plan,
            new_name=new_name,
            new_surname=new_surname,
            new_address=new_address,
            new_city=new_city,
            new_postal_code=new_postal_code,
            new_dni=new_dni,
            new_phone_number=new_phone_number
        )
        return updated_client
    except Exception as e:
        print(f"Error updating client information: {e}")
    return

def create_restaurant(email: str, password: str, role: int, name: str, description: str, city: str, 
                      address: str, phone_number: str, category: str):
    try:
        user_dao = userDAO()
        restaurant_dao = restaurantDAO()
        
        # Create user
        user_vo = userVO(email=email, password=password, role=role)
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
        _ = restaurant_dao.insert(restaurant_vo)
    except Exception as e:
        print(f"Error creating restaurant: {e}")
    return

def update_restaurant_information(email: str, new_name: str = None, new_description: str = None, new_city: str = None, new_address: str = None, new_phone_number: str = None, new_category: str = None):
    try:        
        restaurant_dao = restaurantDAO()
        user_dao = userDAO()

        user = user_dao.get_by_email(email)
        updated_restaurant = restaurant_dao.update(
            user.id,
            new_name=new_name,
            new_description=new_description,
            new_city=new_city,
            new_address=new_address,
            new_phone_number=new_phone_number,
            new_category=new_category
        )
        return updated_restaurant
    except Exception as e:
        print(f"Error updating restaurant information: {e}")

def create_dish(restaurant_id: int, name: str, description: str, price: float, image_url: str):
    try:
        dish_dao = dishDAO()
        
        # Create dish
        dish_vo = dishVO(
            restaurant_id=restaurant_id,
            name=name,
            description=description,
            price=price,
            image_url=image_url
        )
        _ = dish_dao.insert(dish_vo)
    except Exception as e:
        print(f"Error creating dish: {e}")
    return

def update_dish_information(old_dish_name: str, restaurant_id: int, new_name: str, new_description: str, new_allergens: str, new_dish_type: str):
    try:        
        dish_dao = dishDAO()

        dish = dish_dao.get_by_name(old_dish_name)
        updated_dish = dish_dao.update(
            dish.id,
            new_name=new_name,
            new_description=new_description,
            new_allergens=new_allergens,
            new_dish_type=new_dish_type
        )
        return updated_dish
    except Exception as e:
        print(f"Error updating dish information: {e}")
    return

def create_order(client_id: int, restaurant_id: int, credits: int, dishes: list[dict]):
    try:
        order_dao = orderDAO()
        dish_dao = dishDAO()
        ordered_dish_dao = orderedDishDAO()
        
        # Create order
        order_vo = orderVO(
            client_id=client_id,
            restaurant_id=restaurant_id,
            credits=credits
        )
        _, order_id = order_dao.insert(order_vo)

        for item in dishes:           
            dish = dish_dao.get_by_name(item['dish_name'])
            ordered_dish_vo = orderedDishVO(
                order_id=order_id,
                dish_id=dish.id,
                dish_name=item['dish_name'],
                instructions=item['instructions'],
            )
            _ = ordered_dish_dao.insert(ordered_dish_vo)
    except Exception as e:
        print(f"Error creating order: {e}")
    return