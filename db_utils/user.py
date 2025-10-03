import os
from supabase import create_client, Client, ClientOptions
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class userVO:
    email: str
    password: str
    role: int

    def __init__(self, email: str, password: str, role: int):
        if not email or not password or not role:
            raise ValueError("email, password, and role are required fields")
        self.email = email
        self.password = password
        self.role = role

class userDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

    def insert(self, vo: userVO):
        res = self.supabase.table("Users").insert({
            "email": vo.email,
            "password": vo.password,
            "role": vo.role
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, user_id: int, new_email: str = None, new_password: str = None, new_role: int = None):
        update_data = {}
        
        if new_email is not None:
            update_data["email"] = new_email
        if new_password is not None:
            update_data["password"] = new_password
        if new_role is not None:
            update_data["role"] = new_role
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Users").update(update_data).eq("id", user_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, user_id: int):
        res = self.supabase.table("Users").delete().eq("id", user_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Users").select("*").execute()
        return [userVO(**row) for row in res.data]

    def get_by_id(self, user_id: int):
        res = self.supabase.table("Users").select("*").eq("id", user_id).single().execute()
        return userVO(**res.data) if res.data else None
    
    def get_clients(self):
        res = self.supabase.table("Users").select("*").eq("role", "client").execute()
        return [userVO(**row) for row in res.data]
    
    def get_restaurants(self):
        res = self.supabase.table("Users").select("*").eq("role", "restaurant").execute()
        return [userVO(**row) for row in res.data]
    
    def get_admin(self):
        res = self.supabase.table("Users").select("*").eq("role", "admin").execute()
        return [userVO(**row) for row in res.data]

    def get_by_email(self, email: str):
        res = self.supabase.table("Users").select("*").eq("email", email).single().execute()
        return userVO(**res.data) if res.data else None