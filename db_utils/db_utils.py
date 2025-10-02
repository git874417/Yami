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
