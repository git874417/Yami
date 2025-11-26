import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

class subscriptionPlanVO:
    def __init__(self, credits: int, name: str, id: int = None):
        if not credits or not name:
            raise ValueError("credits and name are required fields")
        
        self.credits = credits
        self.name = name
        self.__id = id

    @property
    def id(self):
        return self.__id