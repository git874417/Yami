from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
from db_utils import db_utils
from project.db_utils.userDAO import userDAO

# Añadir el directorio 'project' al path para poder importar 'db_utils'
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)


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

# --- Modelos de Datos (Pydantic) ---
# FastAPI los usa para validar los datos de las peticiones
class ClientCreate(BaseModel):
    email: str
    password: str
    sub_plan: str
    name: str
    surname: str
    address: str
    city: str
    postal_code: str
    dni: str
    phone_number: str

# --- Endpoints de la API ---

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Yami"}

@app.post("/api/clients", status_code=201)
def create_client_endpoint(client: ClientCreate):
    """
    Crea un nuevo cliente en la base de datos.
    """
    try:
        client_id = db_utils.create_client(
            email=client.email,
            password=client.password,
            sub_plan=client.sub_plan,
            name=client.name,
            surname=client.surname,
            address=client.address,
            city=client.city,
            postal_code=client.postal_code,
            dni=client.dni,
            phone_number=client.phone_number
        )
        if client_id is None:
            raise HTTPException(status_code=400, detail="No se pudo crear el cliente.")
            
        return {"message": "Cliente creado exitosamente", "client_id": client_id}
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

# Para ejecutar la app, usa el comando:
# uvicorn project.src.application:app --reload
