import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from db_utils.restaurantVO import restaurantVO

load_dotenv()

class restaurantDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

    def insert(self, vo: restaurantVO):
        restaurant_data = {
            "user_id": vo.user_id,
            "name": vo.name,
            "description": vo.description,
            "city": vo.city,
            "address": vo.address,
            "phone_number": vo.phone_number,
            "category": vo.category
        }
        
        # Agregar logo_url solo si está presente
        if vo.logo_url:
            restaurant_data["logo_url"] = vo.logo_url
            
        res = self.supabase.table("Restaurants").insert(restaurant_data).execute()
        return res.data, res.data[0]["id"]

    def update(self, restaurant_id: int, data_to_update: dict):
        """
        Actualiza los campos de un restaurante en la base de datos usando un diccionario.
        """
        if not data_to_update:
            print("No fields to update.")
            return restaurant_id  # No hay campos para actualizar, retorna el ID sin cambios.
            
        try:
            res = self.supabase.table("Restaurants").update(data_to_update).eq("id", restaurant_id).execute()
            
            if not res.data:
                raise Exception(f"Restaurant with id {restaurant_id} not found or no changes made.")
            
            # Retorna el ID del restaurante actualizado
            return res.data[0]['id']
        except Exception as e:
            print(f"Error in restaurantDAO.update: {e}")
            raise

    def delete(self, restaurant_id: int):
        res = self.supabase.table("Restaurants").delete().eq("id", restaurant_id).execute()
        return res.data
    
    def delete_all(self):
        res = self.supabase.table("Restaurants").delete().neq("id", 0).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Restaurants").select("*").execute()
        return [restaurantVO(**row) for row in res.data]

    def get_by_id(self, restaurant_id: int):
        res = self.supabase.table("Restaurants").select("*").eq("id", restaurant_id).single().execute()
        return restaurantVO(**res.data) if res.data else None
    
    def get_by_user_id(self, user_id: int):
        res = self.supabase.table("Restaurants").select("*").eq("user_id", user_id).single().execute()
        return restaurantVO(**res.data) if res.data else None

    def get_by_name(self, name: str):
        res = self.supabase.table("Restaurants").select("*").eq("name", name).single().execute()
        return restaurantVO(**res.data) if res.data else None