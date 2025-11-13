import os
from supabase import create_client, Client, ClientOptions
from datetime import datetime, timedelta
from dotenv import load_dotenv
from project.db_utils.clientVO import clientVO

load_dotenv()

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
        return res.data, res.data[0]["id"]

    def update(self, client_id: int, data_to_update: dict):
        """
        Actualiza los campos de un cliente en la base de datos usando un diccionario.
        """
        if not data_to_update:
            print("No fields to update.")
            return client_id  # No hay campos para actualizar, retorna el ID sin cambios.
            
        try:
            res = self.supabase.table("Clients").update(data_to_update).eq("id", client_id).execute()
            
            if not res.data:
                raise Exception(f"Client with id {client_id} not found or no changes made.")
            
            # Retorna el ID del cliente actualizado
            return res.data[0]['id']
        except Exception as e:
            print(f"Error in clientDAO.update: {e}")
            raise

    def delete(self, client_id: int):
        res = self.supabase.table("Clients").delete().eq("id", client_id).execute()
        return res.data
    
    def delete_all(self):
        res = self.supabase.table("Clients").delete().neq("id", 0).execute()
        return res.data
    
    def get_all(self):
        res = self.supabase.table("Clients").select("*").execute()
        return [clientVO(**row) for row in res.data]

    def get_by_id(self, client_id: int):
        res = self.supabase.table("Clients").select("*").eq("id", client_id).single().execute()
        return clientVO(**res.data) if res.data else None
    
    def get_by_user_id(self, user_id: int):
        res = self.supabase.table("Clients").select("*").eq("user_id", user_id).single().execute()
        return clientVO(**res.data) if res.data else None
    
    def update_credits_after_order(self, client_id: int, credits: int):
        client = self.supabase.table("Clients").select("available_credits").eq("id", client_id).single().execute()
        current_credits = client.data["available_credits"]
        new_credits = current_credits - credits if current_credits is not None else 0
        if new_credits < 0:
            raise ValueError("Insufficient credits")
        res = self.supabase.table("Clients").update({"available_credits": new_credits}).eq("id", client_id).execute()
        return res.data
    
    def update_credits(self, client_id: int, force_update: bool = False):

        client = self.supabase.table("Clients").select("*").eq("id", client_id).single().execute()
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
        if current_date >= one_month_later or force_update:
            updated_timestamp = one_month_later.strftime('%Y-%m-%d %H:%M:%S.%f')
        else:
            updated_timestamp = time_stamp

        # Obtener los créditos del plan de suscripción
        credits = self.supabase.table("SubscriptionPlans").select("credits").eq("name", sub_plan).single().execute().data["credits"]

        res = self.supabase.table("Clients").update({"available_credits": credits, "subscription_renewal_date": updated_timestamp}).eq("id", client_id).execute()
        return res.data

    def update_credits_after_cancellation(self, client_id: int, credits: int):
        client = self.supabase.table("Clients").select("available_credits").eq("id", client_id).single().execute()
        current_credits = client.data["available_credits"]
        new_credits = current_credits + credits if current_credits is not None else credits
        res = self.supabase.table("Clients").update({"available_credits": new_credits}).eq("id", client_id).execute()
        return res.data