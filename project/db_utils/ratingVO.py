import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

class ratingVO:

    def __init__(self, client_id: int, restaurant_id: int, rating: int, id: int = None):
        if not client_id or not restaurant_id or rating is None:
            raise ValueError("client_id, restaurant_id, and rating are required fields")
        
        if rating < 1 or rating > 5:
            raise ValueError("rating must be between 1 and 5")
        
        self.client_id = client_id
        self.restaurant_id = restaurant_id
        self.rating = rating
        self.__id = id

    @property
    def id(self):
        return self.__id
    