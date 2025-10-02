import os
from supabase import create_client, Client
from dataclasses import dataclass

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