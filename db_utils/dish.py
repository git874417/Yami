import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

class dishVO:


    def __init__(self, restaurant_id: int, name: str, description: str, allergens: str, dish_type: str, id: int = None):
        if not restaurant_id or not name or not dish_type:
            raise ValueError("restaurant_id, name, and dish_type are required fields")
        
        self.restaurant_id = restaurant_id
        self.name = name
        self.description = description
        self.allergens = allergens
        self.dish_type = dish_type
        self.__id = id

    @property
    def id(self):
        return self.__id
    
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

    def delete_all(self):
        res = self.supabase.table("Dishes").delete().neq("id", 0).execute()
        return res.data
    
    def get_all(self):
        res = self.supabase.table("Dishes").select("*").execute()
        return [dishVO(**row) for row in res.data]

    def get_by_id(self, dish_id: int):
        res = self.supabase.table("Dishes").select("*").eq("id", dish_id).single().execute()
        return res.data 

    def get_by_name(self, dish_name: str, restaurant_id: int):
        res = self.supabase.table("Dishes").select("*").eq("name", dish_name).eq("restaurant_id", restaurant_id).single().execute()
        return res.data 