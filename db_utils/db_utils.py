import os
from supabase import create_client, Client
from dataclasses import dataclass

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

        ##Actualizar con los planes y sus creditos
        if sub_plan == "free":
            credits = 5
        elif sub_plan == "basic":
            credits = 15
        else:
            credits = 0
        
        res = self.supabase.table("Clients").update({"available_credits": credits}).eq("id", user_id).execute()
        return res.data 
