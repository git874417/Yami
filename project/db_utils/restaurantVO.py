import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()


class restaurantVO:

    def __init__(self, user_id: int, name: str, description: str, city: str, address: str, phone_number: str, category: str, id: int = None):
        if not user_id or not name or not city or not address or not phone_number or not category:
            raise ValueError("user_id, name, city, address, phone_number, and category are required fields")

        self.__id = id
        self.user_id = user_id
        self.name = name
        self.description = description
        self.city = city
        self.address = address
        self.phone_number = phone_number
        self.category = category
    
    @property
    def id(self):
        return self.__id
