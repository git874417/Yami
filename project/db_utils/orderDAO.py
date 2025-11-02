import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from project.db_utils.orderVO import orderVO

load_dotenv()

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
    
    def delete_all(self):
        res = self.supabase.table("Orders").delete().neq("id", 0).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Orders").select("*").execute()
        return [orderVO(**row) for row in res.data]

    def get_by_id(self, order_id: int):
        res = self.supabase.table("Orders").select("*").eq("id", order_id).single().execute()
        return orderVO(**res.data) if res.data else None

    def get_by_client_id(self, client_id: int):
        res = self.supabase.table("Orders").select("*").eq("client_id", client_id).execute()
        return [orderVO(**row) for row in res.data] if res.data else []

    def get_by_restaurant_id(self, restaurant_id: int):
        res = self.supabase.table("Orders").select("*").eq("restaurant_id", restaurant_id).execute()
        return [orderVO(**row) for row in res.data] if res.data else []