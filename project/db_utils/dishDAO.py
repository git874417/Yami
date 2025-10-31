import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv 
from project.db_utils.dishVO import dishVO

load_dotenv()
    
class dishDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

    def insert(self, vo: dishVO):
        res = self.supabase.table("Dishes").insert({
            "restaurant_id": vo.restaurant_id,
            "name": vo.name,
            "description": vo.description,
            "allergens": vo.allergens,
            "dish_type": vo.dish_type
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, dish_id: int, data_to_update: dict):
        if not data_to_update:
            print("No fields to update.")
            return dish_id  # No hay campos para actualizar, retorna el ID sin cambios.

        try:
            res = self.supabase.table("Dishes").update(data_to_update).eq("id", dish_id).execute()

            if not res.data:
                raise Exception(f"Dish with id {dish_id} not found or no changes made.")

            # Retorna el ID del plato actualizado
            return res.data[0]['id']
        except Exception as e:
            print(f"Error in dishDAO.update: {e}")
            raise

    def delete(self, dish_id: int):
        res = self.supabase.table("Dishes").delete().eq("id", dish_id).execute()
        return res.data

    def delete_all(self):
        res = self.supabase.table("Dishes").delete().neq("id", 0).execute()
        return res.data
    
    def get_all(self):
        res = self.supabase.table("Dishes").select("*").execute()
        return [dishVO(**row) for row in res.data]
    
    def get_all_from_restaurant(self, restaurant_id: int):
        res = self.supabase.table("Dishes").select("*").eq("restaurant_id", restaurant_id).execute()
        return [dishVO(**row) for row in res.data]

    def get_by_id(self, dish_id: int):
        res = self.supabase.table("Dishes").select("*").eq("id", dish_id).single().execute()
        return dishVO(**res.data) if res.data else None 

    def get_by_name(self, dish_name: str, restaurant_id: int):
        res = self.supabase.table("Dishes").select("*").eq("name", dish_name).eq("restaurant_id", restaurant_id).single().execute()
        return dishVO(**res.data) if res.data else None 
    