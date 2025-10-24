import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from project.db_utils.restaurantVO import restaurantVO

load_dotenv()

class restaurantDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

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
    
    def delete_all(self):
        res = self.supabase.table("Restaurants").delete().neq("id", 0).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Restaurants").select("*").execute()
        return [restaurantVO(**row) for row in res.data]

    def get_by_id(self, restaurant_id: int):
        res = self.supabase.table("Restaurants").select("*").eq("id", restaurant_id).single().execute()
        return restaurantVO(**res.data) if res.data else None