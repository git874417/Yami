import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from db_utils.userVO import userVO

load_dotenv()

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

    def update(self, user_id: int, data_to_update: dict):
        """
        Actualiza un usuario en la base de datos a partir de un diccionario.
        Filtra los datos para solo permitir la actualización de campos válidos.
        """
        allowed_fields = ["email", "password", "role", "image_url"]
        update_data = {key: value for key, value in data_to_update.items() if key in allowed_fields}

        if not update_data:
            return None, None  # No hay campos válidos para actualizar

        res = self.supabase.table("Users").update(update_data).eq("id", user_id).execute()

        # Comprobar si la actualización devolvió algún dato
        if not res.data:
            return None, None # Ocurre si el user_id no fue encontrado

        return res.data, res.data[0]["id"]

    def delete(self, user_id: int):
        res = self.supabase.table("Users").delete().eq("id", user_id).execute()
        return res.data
    
    def delete_all_clients(self):
        res = self.supabase.table("Users").delete().eq("role", "Client").execute()
        return res.data

    def delete_all_restaurants(self):
        res = self.supabase.table("Users").delete().eq("role", "Restaurant").execute()
        return res.data
            
    def get_all(self):
        res = self.supabase.table("Users").select("*").execute()
        return [userVO(**row) for row in res.data]

    def get_by_id(self, user_id: int):
        res = self.supabase.table("Users").select("*").eq("id", user_id).single().execute()
        return userVO(**res.data) if res.data else None

    def get_clients(self):
        res = self.supabase.table("Users").select("*").eq("role", "Client").execute()
        return [userVO(**row) for row in res.data]

    def get_restaurants(self):
        res = self.supabase.table("Users").select("*").eq("role", "Restaurant").execute()
        return [userVO(**row) for row in res.data]

    def get_admin(self):
        res = self.supabase.table("Users").select("*").eq("role", "Admin").execute()
        return [userVO(**row) for row in res.data]

    def get_by_email(self, email: str):
        res = self.supabase.table("Users").select("*").eq("email", email).single().execute()
        return userVO(**res.data) if res.data else None