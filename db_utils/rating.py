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

    def update(self, rating_id: int, new_rating: int = None):
        update_data = {}
        
        if new_rating is not None:
            if new_rating < 1 or new_rating > 5:
                raise ValueError("rating must be between 1 and 5")
            update_data["rating"] = new_rating
        
        if not update_data:
            return None  # No fields to update
            
        res = self.supabase.table("Ratings").update(update_data).eq("id", rating_id).execute()
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
