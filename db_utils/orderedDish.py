import os
from supabase import create_client, Client, ClientOptions
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
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
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))
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