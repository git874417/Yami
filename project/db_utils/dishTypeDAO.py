import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from project.db_utils.dishTypeVO import dishTypeVO

load_dotenv()
    
class dishTypeDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

    def insert(self, vo: dishTypeVO):
        res = self.supabase.table("DishTypes").insert({
            "credits": vo.credits,
            "name": vo.name
        }).execute()
        return res.data, res.data[0]["id"]

    def update(self, plan_id: int, new_credits: int = None, new_name: str = None):
        update_data = {}
        
        if new_credits is not None:
            update_data["credits"] = new_credits
        if new_name is not None:
            update_data["name"] = new_name
        
        if not update_data:
            return None  # No fields to update

        res = self.supabase.table("DishTypes").update(update_data).eq("id", plan_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, dishType_id: int):
        res = self.supabase.table("DishTypes").delete().eq("id", dishType_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("DishTypes").select("name, credits").execute()
        return [dishTypeVO(**row) for row in res.data]
    
    def get_credits_by_name(self, name: str):
        res = self.supabase.table("DishTypes").select("credits").eq("name", name).single().execute()
        return res.data["credits"] if res.data else None