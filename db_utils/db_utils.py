import os
from supabase import create_client, Client
from dataclasses import dataclass

# --- VO (Value Object) ---
@dataclass(frozen=True)
class ClientVO:
    id: int
    name: str
    email: str
    user_id: int

# --- DAO (Data Access Object) ---
class ClientDAO:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)

    def insert(self, vo: ClientVO):
        res = self.supabase.table("clients").insert({
            "id": vo.id,
            "name": vo.name,
            "email": vo.email,
            "user_id": vo.user_id
        }).execute()
        return res.data

    def update(self, client_id: int, new_name: str):
        res = self.supabase.table("clients").update({"name": new_name}).eq("id", client_id).execute()
        return res.data

    def delete(self, client_id: int):
        res = self.supabase.table("clients").delete().eq("id", client_id).execute()
        return res.data

    def find_all(self):
        res = self.supabase.table("clients").select("*").execute()
        return [ClientVO(**row) for row in res.data]

    def find_by_id(self, client_id: int):
        res = self.supabase.table("clients").select("*").eq("id", client_id).single().execute()
        return ClientVO(**res.data) if res.data else None


# --- Example usage ---
if __name__ == "__main__":
    dao = ClientDAO()

    # Insert a new client
    new_client = ClientVO(1, "Alice", "alice@example.com", 10)
    print("Inserted:", dao.insert(new_client))

    # Update the client’s name
    print("Updated:", dao.update(1, "Alice Smith"))

    # Extract all clients
    print("All clients:", dao.find_all())

    # Extract one client
    print("Client by ID:", dao.find_by_id(1))

    # Delete client
    print("Deleted:", dao.delete(1))
