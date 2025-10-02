import os
from supabase import create_client, Client
from dataclasses import dataclass
from datetime import datetime, timedelta

# --- VO (Value Object) ---
@dataclass(frozen=True)
class userVO:
    email: str
    password: str
    role: int

    def __init__(self, email: str, password: str, role: int):
        if not email or not password or not role:
            raise ValueError("email, password, and role are required fields")
        self.email = email
        self.password = password
        self.role = role

# --- DAO (Data Access Object) ---
class userDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: userVO):
        res = self.supabase.table("users").insert({
            "email": vo.email,
            "password": vo.password,
            "role": vo.role
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, user_id: int, new_email: str = None, new_password: str = None, new_role: int = None):
        update_data = {}
        
        if new_email is not None:
            update_data["email"] = new_email
        if new_password is not None:
            update_data["password"] = new_password
        if new_role is not None:
            update_data["role"] = new_role
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("users").update(update_data).eq("id", user_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, user_id: int):
        res = self.supabase.table("Users").delete().eq("id", user_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Users").select("*").execute()
        return [userVO(**row) for row in res.data]

    def get_by_id(self, user_id: int):
        res = self.supabase.table("Users").select("*").eq("id", user_id).single().execute()
        return userVO(**res.data) if res.data else None
    
    def get_clients(self):
        res = self.supabase.table("Users").select("*").eq("role", "client").execute()
        return [userVO(**row) for row in res.data]
    
    def get_restaurants(self):
        res = self.supabase.table("Users").select("*").eq("role", "restaurant").execute()
        return [userVO(**row) for row in res.data]
    
    def get_admin(self):
        res = self.supabase.table("Users").select("*").eq("role", "admin").execute()
        return [userVO(**row) for row in res.data]

@dataclass(frozen=True)
class clientVO:
    user_id: int
    sub_plan: str
    name: int
    surname: int
    address: str
    city: str
    postal_code: str
    dni: str
    phone_number: str
    available_credits: int

    def __init__(self, user_id: int, sub_plan: str, name: int, surname: int, address: str, city: str, postal_code: str, dni: str, phone_number: str):
        
        if not user_id or not sub_plan:
            raise ValueError("user_id and sub_plan are required fields")
        
        ##Actualizar con los planes y sus creditos
        if sub_plan == "free":
            credits = 5
        elif sub_plan == "basic":
            credits = 15
        else:
            credits = 0
        
        self.user_id = user_id
        self.sub_plan = sub_plan
        self.name = name
        self.surname = surname
        self.address = address
        self.city = city
        self.postal_code = postal_code
        self.dni = dni
        self.phone_number = phone_number
        self.available_credits = credits

class clientDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: clientVO):
        res = self.supabase.table("Clients").insert({
            "user_id": vo.user_id,
            "sub_plan": vo.sub_plan,
            "name": vo.name,
            "surname": vo.surname,
            "address": vo.address,
            "city": vo.city,
            "postal_code": vo.postal_code,
            "dni": vo.dni,
            "phone_number": vo.phone_number,
            "available_credits": vo.available_credits
        }).execute()
        return res.data

    def update(self, user_id: int, new_sub_plan: str = None, new_name: str = None, new_surname: str = None, new_address: str = None, new_city: str = None, new_postal_code: str = None, new_dni: str = None, new_phone_number: str = None, new_available_credits: int = None):
        update_data = {}
        
        if new_sub_plan is not None:
            update_data["sub_plan"] = new_sub_plan
        if new_name is not None:
            update_data["name"] = new_name
        if new_surname is not None:
            update_data["surname"] = new_surname
        if new_address is not None:
            update_data["address"] = new_address
        if new_city is not None:
            update_data["city"] = new_city
        if new_postal_code is not None:
            update_data["postal_code"] = new_postal_code
        if new_dni is not None:     
            update_data["dni"] = new_dni
        if new_phone_number is not None:
            update_data["phone_number"] = new_phone_number
        if new_available_credits is not None:
            update_data["available_credits"] = new_available_credits
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Clients").update(update_data).eq("id", user_id).execute()
        return res.data

    def delete(self, client_id: int):
        res = self.supabase.table("Clients").delete().eq("id", client_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Clients").select("*").execute()
        return [userVO(**row) for row in res.data]

    def get_by_id(self, user_id: int):
        res = self.supabase.table("Clients").select("*").eq("id", user_id).single().execute()
        return userVO(**res.data) if res.data else None
    
    def update_credits(self, user_id: int):

        client = self.supabase.table("Clients").select("*").eq("user_id", user_id).single().execute()
        sub_plan = client.data["sub_plan"]
        time_stamp = client.data["subscription_renewal_date"]

        # Convertir el timestamp a datetime si es string
        if isinstance(time_stamp, str):
            created_date = datetime.fromisoformat(time_stamp)
        else:
            created_date = time_stamp
        
        # Obtener fecha actual
        current_date = datetime.now()
        
        # Calcular si ha pasado un mes
        # Manejar el cambio de mes y año correctamente
        if created_date.month == 12:
            one_month_later = created_date.replace(year=created_date.year + 1, month=1)
        else:
            one_month_later = created_date.replace(month=created_date.month + 1)
        
        # Si ha pasado un mes, actualizar la fecha
        if current_date >= one_month_later:
            updated_timestamp = one_month_later.strftime('%Y-%m-%d %H:%M:%S.%f')
        else:
            updated_timestamp = time_stamp

        # Obtener los créditos del plan de suscripción
        credits = self.supabase.table("SubscriptionPlans").select("credits").eq("name", sub_plan).single().execute().data["credits"]

        res = self.supabase.table("Clients").update({"available_credits": credits, "created_at": updated_timestamp}).eq("id", user_id).execute()
        return res.data

@dataclass(frozen=True)
class restaurantVO:
    user_id: int
    name: str
    description: str
    city: str
    address: str
    phone_number: str
    category: str

    def __init__(self, user_id: int, name: str, description: str, city: str, address: str, phone_number: str, category: str):
        if not user_id or not name or not city or not address or not phone_number or not category:
            raise ValueError("user_id, name, city, address, phone_number, and category are required fields")
        
        self.user_id = user_id
        self.name = name
        self.description = description
        self.city = city
        self.address = address
        self.phone_number = phone_number
        self.category = category

class restaurantDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: restaurantVO):
        res = self.supabase.table("Restaurants").insert({
            "user_id": vo.user_id,
            "name": vo.name,
            "description": vo.description,
            "city": vo.city,
            "address": vo.address,
            "phone_number": vo.phone_number,
            "category": vo.category
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, restaurant_id: int, new_name: str = None, new_description: str = None, new_city: str = None, new_address: str = None, new_phone_number: str = None, new_category: str = None):
        update_data = {}
        
        if new_name is not None:
            update_data["name"] = new_name
        if new_description is not None:
            update_data["description"] = new_description
        if new_city is not None:
            update_data["city"] = new_city
        if new_address is not None:
            update_data["address"] = new_address
        if new_phone_number is not None:
            update_data["phone_number"] = new_phone_number
        if new_category is not None:
            update_data["category"] = new_category
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Restaurants").update(update_data).eq("id", restaurant_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, restaurant_id: int):
        res = self.supabase.table("Restaurants").delete().eq("id", restaurant_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Restaurants").select("*").execute()
        return [restaurantVO(**row) for row in res.data]

    def get_by_id(self, restaurant_id: int):
        res = self.supabase.table("Restaurants").select("*").eq("id", restaurant_id).single().execute()
        return restaurantVO(**res.data) if res.data else None

@dataclass(frozen=True)
class dishVO:
    restaurant_id: int
    name: str
    description: str
    allergens: str
    dish_type: str

    def __init__(self, restaurant_id: int, name: str, description: str, allergens: str, dish_type: str):
        if not restaurant_id or not name or not dish_type:
            raise ValueError("restaurant_id, name, and dish_type are required fields")
        
        self.restaurant_id = restaurant_id
        self.name = name
        self.description = description
        self.allergens = allergens
        self.dish_type = dish_type

class dishDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: dishVO):
        res = self.supabase.table("Dishes").insert({
            "restaurant_id": vo.restaurant_id,
            "name": vo.name,
            "description": vo.description,
            "allergens": vo.allergens,
            "dish_type": vo.dish_type
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, dish_id: int, new_name: str = None, new_description: str = None, new_allergens: str = None, new_dish_type: str = None):
        update_data = {}
        
        if new_name is not None:
            update_data["name"] = new_name
        if new_description is not None:
            update_data["description"] = new_description
        if new_allergens is not None:
            update_data["allergens"] = new_allergens
        if new_dish_type is not None:
            update_data["dish_type"] = new_dish_type
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Dishes").update(update_data).eq("id", dish_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, dish_id: int):
        res = self.supabase.table("Dishes").delete().eq("id", dish_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Dishes").select("*").execute()
        return [dishVO(**row) for row in res.data]

    def get_by_id(self, dish_id: int):
        res = self.supabase.table("Dishes").select("*").eq("id", dish_id).single().execute()
        return dishVO(**res.data) if res.data else None

@dataclass(frozen=True)
class subscriptionPlanVO:
    credits: int
    name: str

    def __init__(self, credits: int, name: str):
        if not credits or not name:
            raise ValueError("credits and name are required fields")
        
        self.credits = credits
        self.name = name

class subscriptionPlanDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: subscriptionPlanVO):
        res = self.supabase.table("SubscriptionPlans").insert({
            "credits": vo.credits,
            "name": vo.name
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, plan_id: int, new_credits: int = None, new_name: str = None):
        update_data = {}
        
        if new_credits is not None:
            update_data["credits"] = new_credits
        if new_name is not None:
            update_data["name"] = new_name
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("SubscriptionPlans").update(update_data).eq("id", plan_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, plan_id: int):
        res = self.supabase.table("SubscriptionPlans").delete().eq("id", plan_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("SubscriptionPlans").select("*").execute()
        return [subscriptionPlanVO(**row) for row in res.data]

    def get_by_id(self, plan_id: int):
        res = self.supabase.table("SubscriptionPlans").select("*").eq("id", plan_id).single().execute()
        return subscriptionPlanVO(**res.data) if res.data else None

@dataclass(frozen=True)
class orderVO:
    client_id: int
    restaurant_id: int
    order_credits: int

    def __init__(self, client_id: int, restaurant_id: int, order_credits: int):
        if not client_id or not restaurant_id or order_credits is None:
            raise ValueError("client_id, restaurant_id, and order_credits are required fields")
        
        self.client_id = client_id
        self.restaurant_id = restaurant_id
        self.order_credits = order_credits

class orderDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: orderVO):
        res = self.supabase.table("Orders").insert({
            "client_id": vo.client_id,
            "restaurant_id": vo.restaurant_id,
            "order_credits": vo.order_credits
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, order_id: int, new_client_id: int = None, new_restaurant_id: int = None, new_order_credits: int = None):
        update_data = {}
        
        if new_client_id is not None:
            update_data["client_id"] = new_client_id
        if new_restaurant_id is not None:
            update_data["restaurant_id"] = new_restaurant_id
        if new_order_credits is not None:
            update_data["order_credits"] = new_order_credits
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Orders").update(update_data).eq("id", order_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, order_id: int):
        res = self.supabase.table("Orders").delete().eq("id", order_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Orders").select("*").execute()
        return [orderVO(**row) for row in res.data]

    def get_by_id(self, order_id: int):
        res = self.supabase.table("Orders").select("*").eq("id", order_id).single().execute()
        return orderVO(**res.data) if res.data else None

@dataclass(frozen=True)
class orderedDishVO:
    order_id: int
    dish_id: int
    dish_name: str
    instructions: str

    def __init__(self, order_id: int, dish_id: int, dish_name: str, instructions: str = ""):
        if not order_id or not dish_id or not dish_name:
            raise ValueError("order_id, dish_id, and dish_name are required fields")
        
        self.order_id = order_id
        self.dish_id = dish_id
        self.dish_name = dish_name
        self.instructions = instructions

class orderedDishDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: orderedDishVO):
        res = self.supabase.table("OrderedDishes").insert({
            "order_id": vo.order_id,
            "dish_id": vo.dish_id,
            "dish_name": vo.dish_name,
            "instructions": vo.instructions
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, ordered_dish_id: int, new_dish_name: str = None, new_instructions: str = None):
        update_data = {}
        
        if new_dish_name is not None:
            update_data["dish_name"] = new_dish_name
        if new_instructions is not None:
            update_data["instructions"] = new_instructions
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("OrderedDishes").update(update_data).eq("id", ordered_dish_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, ordered_dish_id: int):
        res = self.supabase.table("OrderedDishes").delete().eq("id", ordered_dish_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("OrderedDishes").select("*").execute()
        return [orderedDishVO(**row) for row in res.data]

    def get_by_id(self, ordered_dish_id: int):
        res = self.supabase.table("OrderedDishes").select("*").eq("id", ordered_dish_id).single().execute()
        return orderedDishVO(**res.data) if res.data else None

@dataclass(frozen=True)
class ratingVO:
    client_id: int
    restaurant_id: int
    rating: int

    def __init__(self, client_id: int, restaurant_id: int, rating: int):
        if not client_id or not restaurant_id or rating is None:
            raise ValueError("client_id, restaurant_id, and rating are required fields")
        
        if rating < 1 or rating > 5:
            raise ValueError("rating must be between 1 and 5")
        
        self.client_id = client_id
        self.restaurant_id = restaurant_id
        self.rating = rating

class ratingDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: ratingVO):
        res = self.supabase.table("Ratings").insert({
            "client_id": vo.client_id,
            "restaurant_id": vo.restaurant_id,
            "rating": vo.rating
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, rating_id: int, new_rating: int = None):
        update_data = {}
        
        if new_rating is not None:
            if new_rating < 1 or new_rating > 5:
                raise ValueError("rating must be between 1 and 5")
            update_data["rating"] = new_rating
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Ratings").update(update_data).eq("id", rating_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, rating_id: int):
        res = self.supabase.table("Ratings").delete().eq("id", rating_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Ratings").select("*").execute()
        return [ratingVO(**row) for row in res.data]

    def get_by_id(self, rating_id: int):
        res = self.supabase.table("Ratings").select("*").eq("id", rating_id).single().execute()
        return ratingVO(**res.data) if res.data else None 
