import os
from supabase import create_client, Client, ClientOptions
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class subscriptionPlanVO:
    credits: int
    name: str

    def __init__(self, credits: int, name: str):
        if not credits or not name:
            raise ValueError("credits and name are required fields")
        
        self.credits = credits
        self.name = name

class subscriptionPlanDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key, options=ClientOptions(
            schema="sisinf_p3",
        ))

    def insert(self, vo: subscriptionPlanVO):
        res = self.supabase.table("SubscriptionPlans").insert({
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
            
        res = self.supabase.table("SubscriptionPlans").update(update_data).eq("id", plan_id).execute()
        return res.data, res.data[0]["id"]

    def delete(self, plan_id: int):
        res = self.supabase.table("SubscriptionPlans").delete().eq("id", plan_id).execute()
        return res.data

    def get_all(self):
        res = self.supabase.table("SubscriptionPlans").select("*").execute()
        return [subscriptionPlanVO(**row) for row in res.data]

    def get_by_id(self, plan_id: int):
        res = self.supabase.table("SubscriptionPlans").select("*").eq("id", plan_id).single().execute()
        return subscriptionPlanVO(**res.data) if res.data else None
    
    def get_by_plan_credits(self, plan: str):
        credits = self.supabase.table("SubscriptionPlans").select("credits").eq("name", plan).single().execute()
        return credits.data["credits"] if credits.data else None
