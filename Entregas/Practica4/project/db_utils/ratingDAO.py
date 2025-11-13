import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from project.db_utils.ratingVO import ratingVO

load_dotenv()

class ratingDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))
    def insert(self, vo: ratingVO):
        res = self.supabase.table("Ratings").insert({
            "client_id": vo.client_id,
            "restaurant_id": vo.restaurant_id,
            "rating": vo.rating
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, rating_id: int, data_to_update: dict | None = None):
        if data_to_update is None:
            return None  # No fields to update
        
        if 'rating' in data_to_update:
            rating_value = data_to_update['rating']
            if not isinstance(rating_value, int) or not (1 <= rating_value <= 5):
                raise ValueError("El rating debe ser un número entero entre 1 y 5.")

        res = self.supabase.table("Ratings").update(data_to_update).eq("id", rating_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, rating_id: int):
        res = self.supabase.table("Ratings").delete().eq("id", rating_id).execute()
        return res.data
    
    def delete_all(self):
        res = self.supabase.table("Ratings").delete().neq("id", 0).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("Ratings").select("*").execute()
        return [ratingVO(**row) for row in res.data]

    def get_by_id(self, rating_id: int):
        res = self.supabase.table("Ratings").select("*").eq("id", rating_id).single().execute()
        return ratingVO(**res.data) if res.data else None 

    def get_average_rating_by_restaurant(self, restaurant_id: int):
        # En lugar de usar RPC, usamos una consulta SQL directa
        res = self.supabase.table("Ratings").select("rating").eq("restaurant_id", restaurant_id).execute()
        if res.data:
            # Calcular el promedio de los ratings
            ratings = [r['rating'] for r in res.data]
            if ratings:
                return round(sum(ratings) / len(ratings), 2)
        return 0.0
