import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()


class orderedDishVO:

    def __init__(self, order_id: int, dish_id: int, dish_name: str, id: int = None, instructions: str = ""):
        if not order_id or not dish_id or not dish_name:
            raise ValueError("order_id, dish_id, and dish_name are required fields")
        
        self.order_id = order_id
        self.dish_id = dish_id
        self.dish_name = dish_name
        self.__id = id
        self.instructions = instructions

    @property
    def id(self):
        return self.__id
    