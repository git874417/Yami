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
    