import os
from supabase import create_client, Client, ClientOptions
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class orderVO:
    _id: int
    client_id: int
    restaurant_id: int
    order_credits: int
    order_status: str

    def __init__(self, client_id: int, restaurant_id: int, order_credits: int, _id: int = None, order_status: str = "Encargado"):
        if not client_id or not restaurant_id or order_credits is None:
            raise ValueError("client_id, restaurant_id, and order_credits are required fields")
        if client_id < 0 or restaurant_id < 0 or order_credits < 0:
            raise ValueError("client_id, restaurant_id, and order_credits must be non-negative")
        
        self.client_id = client_id
        self.restaurant_id = restaurant_id
        self.order_credits = order_credits
        self._id = _id 
        self.order_status = order_status 

    def __init__(self, client_id: int, restaurant_id: int, order_credits: int, order_status: str = "Encargado"):
        if not client_id or not restaurant_id or order_credits is None:
            raise ValueError("client_id, restaurant_id, and order_credits are required fields")
        if client_id < 0 or restaurant_id < 0 or order_credits < 0:
            raise ValueError("client_id, restaurant_id, and order_credits must be non-negative")
        
        self.client_id = client_id
        self.restaurant_id = restaurant_id
        self.order_credits = order_credits
        self.order_status = order_status

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
    
    def updateOrderStatus(self, new_status: str, order_id: int):

        if new_status not in ["Encargado", "En preparacion", "En reparto", "Entregado", "Cancelado"]:
            raise ValueError("Invalid order status")
        
        res = self.supabase.table("Orders").update({"order_status": new_status}).eq("id", order_id).execute()
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