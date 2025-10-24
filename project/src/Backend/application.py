from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from project.db_utils.userDAO import userDAO
from project.db_utils.clientDAO import clientDAO
from project.src.Backend import services
from project.src.Backend.model import *

app = FastAPI(
    title="Yami API",
    description="La API para la aplicación Yami.",
    version="1.0.0"
)

# --- CORS Middleware ---
# Permite que tu frontend se conecte a esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambia "*" por el dominio de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints de la API ---

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Yami"}

@app.post("/api/create_client", status_code=201)
def create_client_endpoint(client: ClientCreate):
    """
    Crea un nuevo cliente en la base de datos.
    """
    try:
        client_id = services.create_new_client(client)
        if client_id is None:
            raise HTTPException(status_code=400, detail="No se pudo crear el cliente.")
            
        return {"message": "Cliente creado exitosamente", "client_id": client_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.post("/api/update_client/{id}", status_code=200)
def update_client_endpoint(id: int, client: ClientUpdate):
    """
    Actualiza un cliente en la base de datos.
    """
    try:
        client_id = services.update_existing_client(id, client)
        if client_id is None:
            raise HTTPException(status_code=400, detail="No se pudo actualizar el cliente.")

        return {"message": "Cliente actualizado exitosamente", "client_id": client_id}
    except Exception as e:
        # Captura cualquier otra excepción y devuelve un error 500
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

@app.get("/api/users")
def get_all_users():
    """
    Obtiene una lista de todos los usuarios.
    """
    try:
        dao = userDAO()
        users = dao.get_all()
        # Convertir los VOs a diccionarios para la respuesta JSON
        users_list = [{"id": user.id, "email": user.email, "role": user.role} for user in users]
        return {"users": users_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")
    
@app.get("/api/clients")
def get_all_clients():
    """
    Obtiene una lista de todos los clientes.
    """
    try:
        dao = clientDAO()
        clients = dao.get_all()
        # Convertir los VOs a diccionarios para la respuesta JSON
        clients_list = [
            {
            "id": client.id,
            "name": client.name,
            "last_name": client.surname,
            "phone": client.phone_number,
            "address": client.address,
            "user_id": client.user_id,
            "available_credits": client.available_credits
            } for client in clients
        ]
        return {"clients": clients_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")

# Para ejecutar la app, usa el comando:
# uvicorn project.src.Backend.application:app --reload
