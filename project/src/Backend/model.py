from pydantic import BaseModel
from project.db_utils import db_utils

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

class ClientUpdate(BaseModel):
    sub_plan: str | None = None
    name: str | None = None
    surname: str | None = None
    address: str | None = None
    city: str | None = None
    postal_code: str | None = None
    dni: str | None = None
    phone_number: str | None = None

class RestaurantCreate(BaseModel):
    email: str
    password: str
    name: str
    description: str
    address: str
    city: str
    category: str
    phone_number: str

class RestaurantUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    city: str | None = None
    address: str | None = None
    phone_number: str | None = None
    category: str | None = None