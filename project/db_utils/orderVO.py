import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

class orderVO:
    def __init__(self, client_id: int, restaurant_id: int, order_credits: int, id: int = None, order_status: str = "Encargado", order_date: str = None):
        if not client_id or not restaurant_id or order_credits is None:
            raise ValueError("client_id, restaurant_id, and order_credits are required fields")
        if client_id < 0 or restaurant_id < 0 or order_credits < 0:
            raise ValueError("client_id, restaurant_id, and order_credits must be non-negative")
        
        self.client_id = client_id
        self.restaurant_id = restaurant_id
        self.order_credits = order_credits
        self.__id = id  # Cambiar a privado para que sea realmente de solo lectura
        self.order_status = order_status 
        self.order_date = order_date

    @property
    def id(self):
        return self.__id
