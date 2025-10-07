import os
from supabase import create_client, Client, ClientOptions
from dataclasses import dataclass
from datetime import datetime, timedelta
from user import *
from dotenv import load_dotenv

load_dotenv()

@dataclass
class clientVO:
    _id : int
    user_id: int
    sub_plan: str
    name: str
    surname: str
    address: str
    city: str
    postal_code: str
    dni: str
    phone_number: str
    available_credits: int

    def __init__(self, user_id: int, sub_plan: str, name: int, surname: int, address: str, city: str, postal_code: str, dni: str, phone_number: str, 
                available_credits: int = None):
        
        if not user_id or not sub_plan:
            raise ValueError("user_id and sub_plan are required fields")
        
        self.user_id = user_id
        self.sub_plan = sub_plan
        self.name = name
        self.surname = surname
        self.address = address
        self.city = city
        self.postal_code = postal_code
        self.dni = dni
        self.phone_number = phone_number
        self.available_credits = available_credits

class clientDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

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
    
    def update_credits_after_order(self, client_id: int, credits: int):
        client = self.supabase.table("Clients").select("available_credits").eq("id", client_id).single().execute()
        current_credits = client.data["available_credits"]
        new_credits = current_credits - credits if current_credits is not None else 0
        if new_credits < 0:
            raise ValueError("Insufficient credits")
        res = self.supabase.table("Clients").update({"available_credits": new_credits}).eq("id", client_id).execute()
        return res.data
    
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
