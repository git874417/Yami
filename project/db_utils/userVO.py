import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

class userVO:
    def __init__(self, email: str, password: str, role: int, id: int = None):
        if not email or not password or not role:
            raise ValueError("email, password, and role are required fields")
        self.email = email
        self.password = password
        self.role = role
        self.__id = id  # Cambiar a privado para que sea realmente de solo lectura
    
    @property
    def id(self):
        return self.__id