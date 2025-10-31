from project.db_utils import db_utils
from .model import *

def create_new_client(client_data: ClientCreate) -> int:
    """
    Orquesta la creación de un nuevo cliente.
    Aquí puedes añadir más lógica en el futuro (ej. enviar un email de bienvenida).
    """
    try:
        client_id = db_utils.create_client(
            email=client_data.email,
            password=client_data.password,
            sub_plan=client_data.sub_plan,
            name=client_data.name,
            surname=client_data.surname,
            address=client_data.address,
            city=client_data.city,
            postal_code=client_data.postal_code,
            dni=client_data.dni,
            phone_number=client_data.phone_number
        )
        # Futura lógica: enviar_email_bienvenida(client_data.email)
        return client_id
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e

def update_existing_client(id: int, client_data: ClientUpdate) -> int:
    """
    Orquesta la actualización de un cliente existente.
    """
    # Convierte el modelo Pydantic a un diccionario.
    # exclude_unset=True asegura que solo se incluyan los campos que el cliente envió.
    update_data = client_data.model_dump(exclude_unset=True)

    # Si no se envió ningún dato para actualizar, no hacemos nada.
    if not update_data:
        return id # O podrías lanzar un error si lo prefieres

    try:
        # Pasamos el ID y el diccionario de datos a la función de la base de datos.
        client_id = db_utils.update_client_information(
            id=id,
            data_to_update=update_data
        )
        return client_id
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e

def delete_existing_client(client_id: int) -> bool:
    """
    Orquesta la eliminación de un cliente existente.
    Aquí puedes añadir más lógica en el futuro (ej. enviar email de despedida).
    """
    try:
        success = db_utils.delete_client(client_id)
        if success:
            # Futura lógica: enviar_email_despedida(client_email)
            return True
        return False
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e
    
def create_new_restaurant(restaurant_data: RestaurantCreate) -> int:
    """
    Orquesta la creación de un nuevo restaurante.
    Aquí puedes añadir más lógica en el futuro (ej. enviar un email de bienvenida).
    """
    try:
        restaurant_id = db_utils.create_restaurant(
            email=restaurant_data.email,
            password=restaurant_data.password,
            name=restaurant_data.name,
            description=restaurant_data.description,
            address=restaurant_data.address,
            city=restaurant_data.city,
            phone_number=restaurant_data.phone_number,
            category=restaurant_data.category
        )
        # Futura lógica: enviar_email_bienvenida(restaurant_data.email)
        return restaurant_id
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e

def update_existing_restaurant(id: int, restaurant_data: RestaurantUpdate) -> int:
    """
    Orquesta la actualización de un restaurante existente.
    """
    # Convierte el modelo Pydantic a un diccionario.
    # exclude_unset=True asegura que solo se incluyan los campos que el restaurante envió.
    update_data = restaurant_data.model_dump(exclude_unset=True)

    # Si no se envió ningún dato para actualizar, no hacemos nada.
    if not update_data:
        return id # O podrías lanzar un error si lo prefieres

    try:
        # Pasamos el ID y el diccionario de datos a la función de la base de datos.
        restaurant_id = db_utils.update_restaurant_information(
            id=id,
            data_to_update=update_data
        )
        return restaurant_id
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e
    
def delete_existing_restaurant(restaurant_id: int) -> bool:
    """
    Orquesta la eliminación de un restaurante existente.
    """
    try:
        success = db_utils.delete_restaurant(restaurant_id)
        if success:
            # Futura lógica: enviar_email_despedida(restaurant_email)
            # Futura lógica: notificar_clientes_con_pedidos_pendientes()
            return True
        return False
    except Exception as e:
        raise e    