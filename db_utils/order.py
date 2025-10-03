import os
from supabase import create_client, Client, ClientOptions
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class orderVO:
    client_id: int
    restaurant_id: int
    order_credits: int

    def __init__(self, client_id: int, restaurant_id: int, order_credits: int):
        if not client_id or not restaurant_id or order_credits is None:
            raise ValueError("client_id, restaurant_id, and order_credits are required fields")
        
        self.client_id = client_id
        self.restaurant_id = restaurant_id
        self.order_credits = order_credits

class orderDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

    def insert(self, vo: orderVO):
        res = self.supabase.table("Orders").insert({
            "client_id": vo.client_id,
            "restaurant_id": vo.restaurant_id,
            "order_credits": vo.order_credits
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, order_id: int, new_client_id: int = None, new_restaurant_id: int = None, new_order_credits: int = None):
        update_data = {}
        
        if new_client_id is not None:
            update_data["client_id"] = new_client_id
        if new_restaurant_id is not None:
            update_data["restaurant_id"] = new_restaurant_id
        if new_order_credits is not None:
            update_data["order_credits"] = new_order_credits
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Orders").update(update_data).eq("id", order_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, order_id: int):
        res = self.supabase.table("Orders").delete().eq("id", order_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Orders").select("*").execute()
        return [orderVO(**row) for row in res.data]

    def get_by_id(self, order_id: int):
        res = self.supabase.table("Orders").select("*").eq("id", order_id).single().execute()
        return orderVO(**res.data) if res.data else None