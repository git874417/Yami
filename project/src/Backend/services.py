from email.utils import make_msgid
from supabase import Client, create_client
from project.db_utils import db_utils
from .model import *
from passlib.context import CryptContext
import bcrypt
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from project.db_utils.clientDAO import clientDAO
from project.db_utils.userDAO import userDAO
from project.db_utils.restaurantDAO import restaurantDAO
from project.db_utils.dishDAO import dishDAO
from project.db_utils.orderDAO import orderDAO

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compara una contraseña en texto plano con su hash usando bcrypt.
    """
    # bcrypt necesita que ambas contraseñas estén codificadas en bytes.
    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    
    # Compara la contraseña con el hash
    return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)

def get_password_hash(password: str) -> str:
    """
    Genera el hash de una contraseña usando bcrypt.
    """
    # Codificar la contraseña a bytes
    password_bytes = password.encode('utf-8')
    
    # Generar un "salt" y hashear la contraseña
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    
    # Decodificar el hash para guardarlo como string en la base de datos
    return hashed_bytes.decode('utf-8')

def send_welcome_email(recipient_email: str, recipient_name: str):
    """
    Envía un correo de bienvenida formateado con HTML a un nuevo usuario.
    """
    try:
        # Cargar credenciales desde el archivo .env
        sender_email = os.getenv("MAIL_USERNAME")
        password = os.getenv("MAIL_PASSWORD")
        
        if not sender_email or not password:
            print("Advertencia: Credenciales de correo no configuradas en .env. No se enviará el correo.")
            return
        # Crear el cuerpo del correo en HTML
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }}
                .header {{ font-size: 24px; color: #d9534f; text-align: center; }}
                .content {{ margin-top: 20px; }}
                .footer {{ margin-top: 30px; font-size: 12px; text-align: center; color: #888; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">¡Bienvenido a Yami, {recipient_name}!</h1>
                <div class="content">
                    <p>Hola {recipient_name},</p>
                    <p>Gracias por registrarte en Yami. Estamos encantados de tenerte con nosotros.</p>
                    <p>¡Explora los mejores restaurantes y disfruta de tus platos favoritos!</p>
                    <p>El equipo de Yami</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} Yami. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Crear el objeto del mensaje
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "¡Bienvenido a Yami!"
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        # Adjuntar la parte HTML
        msg.attach(MIMEText(html_body, 'html'))

        # Conectar al servidor SMTP y enviar el correo
        with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
            server.starttls()  # Iniciar conexión segura
            server.login(sender_email, password)
            server.send_message(msg)
            print(f"Correo de bienvenida enviado exitosamente a {recipient_email}")

    except Exception as e:
        # Si el correo falla, no debe detener el proceso de registro.
        # Solo se imprime un error en la consola del servidor.
        print(f"Error al enviar correo de bienvenida a {recipient_email}: {e}")

def send_order_confirmation_email(recipient_email: str, recipient_name: str, restaurant_name: str, dishes: list, total_credits: int, order_id: int):
    """
    Envía un correo de confirmación de pedido formateado con HTML, incluyendo desglose de créditos.
    """
    try:
        sender_email = os.getenv("MAIL_USERNAME")
        password = os.getenv("MAIL_PASSWORD")
        
        if not sender_email or not password:
            print("Advertencia: Credenciales de correo no configuradas. No se enviará el correo de confirmación.")
            return

        # --- Construir la lista de platos en HTML con desglose de créditos ---
        dishes_html = ""
        for dish in dishes:
            image_url = dish.get('image_url') or "https://via.placeholder.com/100"
            dishes_html += f"""
            <div class="dish-item">
                <img src="{image_url}" alt="{dish['dish_name']}">
                <div class="dish-info">
                    <strong>{dish['dish_name']}</strong> ({dish['credits']} yameat/s)<br>
                    <small>{dish['dish_type']}</small><br>
                    <em>Instrucciones: {dish.get('instructions', 'Ninguna')}</em>
                </div>
            </div>
            """

        # --- Crear el cuerpo completo del correo ---
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }}
                .header {{ font-size: 24px; color: #d9534f; text-align: center; }}
                .content {{ margin-top: 20px; }}
                .total-cost {{ text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;}}
                .footer {{ margin-top: 30px; font-size: 12px; text-align: center; color: #888; }}
                .dish-item {{ display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px; }}
                .dish-item:last-child {{ border-bottom: none; }}
                .dish-item img {{ width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-right: 15px; }}
                .dish-info {{ flex: 1; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">¡Tu pedido en Yami está en marcha!</h1>
                <div class="content">
                    <p>Hola {recipient_name},</p>
                    <p>Hemos recibido tu pedido del restaurante <strong>{restaurant_name}</strong>. ¡Ya estamos preparando tus platos!</p>
                    <h3>Resumen de tu pedido:</h3>
                    {dishes_html}
                    <div class="total-cost">
                        Total: {total_credits} yameat/s
                    </div>
                    <p>Gracias por confiar en Yami.</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} Yami. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"[Pedido Yami #{order_id}] Confirmación de tu pedido en {restaurant_name}"
        msg['From'] = sender_email
        msg['To'] = recipient_email

        # Extraer el dominio del correo del remitente para usarlo en el Message-ID
        domain = sender_email.split('@')[-1]
        message_id = make_msgid(domain=domain)
        msg['Message-ID'] = message_id
        
        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
            server.starttls()
            server.login(sender_email, password)
            server.send_message(msg)
            print(f"Correo de confirmación de pedido enviado a {recipient_email}")

        return message_id.strip('<>')
    except Exception as e:
        print(f"Error al enviar correo de confirmación de pedido a {recipient_email}: {e}")

def send_order_in_delivery_email(recipient_email: str, recipient_name: str, restaurant_name: str, order_id: int, original_message_id: str = None):
    """
    Envía un correo para notificar que el pedido está en reparto.
    """
    try:
        sender_email = os.getenv("MAIL_USERNAME")
        password = os.getenv("MAIL_PASSWORD")
        
        if not sender_email or not password:
            print("Advertencia: Credenciales de correo no configuradas. No se enviará el correo.")
            return

        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }}
                .header {{ font-size: 24px; color: #d9534f; text-align: center; }}
                .content {{ margin-top: 20px; }}
                .footer {{ margin-top: 30px; font-size: 12px; text-align: center; color: #888; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">¡Tu pedido está en camino!</h1>
                <div class="content">
                    <p>Hola {recipient_name},</p>
                    <p>¡Buenas noticias! Tu pedido del restaurante <strong>{restaurant_name}</strong> ya ha salido del restaurante y está de camino a tu dirección.</p>
                    <p>Puedes seguir el estado de tu pedido en la aplicación.</p>
                    <p>¡Que aproveche!</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} Yami. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"[Pedido Yami #{order_id}] Tu pedido de {restaurant_name} está en camino"
        msg['From'] = sender_email
        msg['To'] = recipient_email

        domain = sender_email.split('@')[-1]
        message_id = make_msgid(domain=domain)
        msg['Message-ID'] = message_id

        if original_message_id:
            print(f"Original Message-ID: {original_message_id}")
            msg['In-Reply-To'] = f"<{original_message_id}>"
            msg['References'] = f"<{original_message_id}>"

        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
            server.starttls()
            server.login(sender_email, password)
            server.send_message(msg)
            print(f"Correo de 'pedido en reparto' enviado a {recipient_email}")

    except Exception as e:
        print(f"Error al enviar correo de 'pedido en reparto' a {recipient_email}: {e}")

def send_order_delivered_email(recipient_email: str, recipient_name: str, restaurant_name: str, order_id: int, original_message_id: str = None):
    """
    Envía un correo para notificar que el pedido ha sido entregado.
    """
    try:
        sender_email = os.getenv("MAIL_USERNAME")
        password = os.getenv("MAIL_PASSWORD")
        
        if not sender_email or not password:
            print("Advertencia: Credenciales de correo no configuradas. No se enviará el correo.")
            return

        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }}
                .header {{ font-size: 24px; color: #d9534f; text-align: center; }}
                .content {{ margin-top: 20px; }}
                .rating-link {{ display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #d9534f; color: #fff; text-decoration: none; border-radius: 5px; }}
                .footer {{ margin-top: 30px; font-size: 12px; text-align: center; color: #888; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">¡Tu pedido ha sido entregado!</h1>
                <div class="content">
                    <p>Hola {recipient_name},</p>
                    <p>Confirmamos que tu pedido del restaurante <strong>{restaurant_name}</strong> ha sido entregado con éxito.</p>
                    <p>Esperamos que hayas disfrutado de tu comida. ¿Qué tal si valoras tu experiencia?</p>
                    <a href="#" class="rating-link">Valorar el restaurante</a>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} Yami. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"[Pedido Yami #{order_id}] Tu pedido de {restaurant_name} ha sido entregado"
        msg['From'] = sender_email
        msg['To'] = recipient_email

        domain = sender_email.split('@')[-1]
        message_id = make_msgid(domain=domain)
        msg['Message-ID'] = message_id

        if original_message_id:
            msg['In-Reply-To'] = f"<{original_message_id}>"
            msg['References'] = f"<{original_message_id}>"

        msg.attach(MIMEText(html_body, 'html'))

        print(msg)

        with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
            server.starttls()
            server.login(sender_email, password)
            server.send_message(msg)
            print(f"Correo de 'pedido entregado' enviado a {recipient_email}")

    except Exception as e:
        print(f"Error al enviar correo de 'pedido entregado' a {recipient_email}: {e}")

def create_new_client(client_data: ClientCreate) -> int:
    """
    Orquesta la creación de un nuevo cliente.
    Aquí puedes añadir más lógica en el futuro (ej. enviar un email de bienvenida).
    """

    hashed_password = get_password_hash(client_data.password)

    try:
        client_id, user_id = db_utils.create_client(
            email=client_data.email,
            password=hashed_password,
            sub_plan=client_data.sub_plan,
            name=client_data.name,
            surname=client_data.surname,
            address=client_data.address,
            city=client_data.city,
            postal_code=client_data.postal_code,
            dni=client_data.dni,
            phone_number=client_data.phone_number
        )

        # Asignar foto de perfil aleatoria
        # Contar archivos profile_X.png en la carpeta ProfileImages
        profile_images_dir = os.path.join(os.path.dirname(__file__), 'ProfileImages')
        profile_files = [f for f in os.listdir(profile_images_dir) if f.startswith('profile_') and f.endswith('.png')]
        
        # Seleccionar un número aleatorio basado en los archivos disponibles
        if profile_files:
            random_index = random.randint(0, len(profile_files) - 1)
            profile_filename = f"profile_{random_index}.png"
            profile_image_path = os.path.join(profile_images_dir, profile_filename)
            
            # Leer el archivo y subirlo
            with open(profile_image_path, 'rb') as f:
                file_content = f.read()
            
            image_url = upload_user_profile_picture(user_id, file_content, "image/png")

        # Futura lógica: enviar_email_bienvenida(client_data.email)
        #send_welcome_email(recipient_email=client_data.email, recipient_name=client_data.name)
        return client_id, user_id, image_url 
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e

def update_existing_user(id: int, user_data: UserUpdate) -> int:
    """
    Orquesta la actualización de un usuario existente.
    """
    # Convierte el modelo Pydantic a un diccionario.
    # exclude_unset=True asegura que solo se incluyan los campos que el usuario envió.
    update_data = user_data.model_dump(exclude_unset=True)

    # Si no se envió ningún dato para actualizar, no hacemos nada.
    if not update_data:
        return id # O podrías lanzar un error si lo prefieres

    # Si se está actualizando la contraseña, hashearla antes de guardarla
    if 'password' in update_data:
        update_data['password'] = get_password_hash(update_data['password'])

    try:
        # Pasamos el ID y el diccionario de datos a la función de la base de datos.
        user_id = db_utils.update_user_information(
            id=id,
            data_to_update=update_data
        )
        return user_id
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
        
        hashed_password = get_password_hash(restaurant_data.password)
        
        restaurant_id, user_id = db_utils.create_restaurant(
            email=restaurant_data.email,
            password=hashed_password,
            name=restaurant_data.name,
            description=restaurant_data.description,
            address=restaurant_data.address,
            city=restaurant_data.city,
            phone_number=restaurant_data.phone_number,
            category=restaurant_data.category
        )
        
        # Asignar foto de perfil aleatoria
        # Contar archivos profile_X.png en la carpeta ProfileImages
        profile_images_dir = os.path.join(os.path.dirname(__file__), 'ProfileImages')
        profile_files = [f for f in os.listdir(profile_images_dir) if f.startswith('profile_') and f.endswith('.png')]
        
        # Seleccionar un número aleatorio basado en los archivos disponibles
        if profile_files:
            random_index = random.randint(0, len(profile_files) - 1)
            profile_filename = f"profile_{random_index}.png"
            profile_image_path = os.path.join(profile_images_dir, profile_filename)
            
            # Leer el archivo y subirlo
            with open(profile_image_path, 'rb') as f:
                file_content = f.read()
            
            image_url = upload_user_profile_picture(user_id, file_content, "image/png")
            
        # Futura lógica: enviar_email_bienvenida(restaurant_data.email)
        return restaurant_id, user_id, image_url
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
            return True
        return False
    except Exception as e:
        raise e

def create_new_dish(restaurant_id: int, dish_data: DishCreate) -> int:
    """
    Orquesta la creación de un nuevo plato.
    """
    try:
        dish_id = db_utils.create_dish(
            restaurant_id=restaurant_id,
            name=dish_data.name,
            description=dish_data.description,
            allergens=dish_data.allergens,
            dish_type=dish_data.dish_type
        )
        return dish_id
    except Exception as e:
        raise e 

def update_existing_dish(dish_id: int, dish_data: DishUpdate) -> int:
    """
    Orquesta la actualización de un plato existente.
    """
    # Convierte el modelo Pydantic a un diccionario.
    update_data = dish_data.model_dump(exclude_unset=True)

    # Si no se envió ningún dato para actualizar, no hacemos nada.
    if not update_data:
        return id

    try:
        # Pasamos el ID y el diccionario de datos a la función de la base de datos.
        dish_id = db_utils.update_dish_information(
            dish_id=dish_id,
            data_to_update=update_data
        )
        return dish_id
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e
    
def delete_existing_dish(dish_id: int) -> bool:
    """
    Orquesta la eliminación de un plato existente.
    """
    try:
        success = db_utils.delete_existing_dish(dish_id)
        return success
    except Exception as e:
        raise e
    
def create_new_order(client_id: int, restaurant_id:int, order_data: OrderCreate) -> int:
    """
    Crea un nuevo pedido en la base de datos.
    Calcula automáticamente los créditos según los tipos de platos.
    Valida que el cliente tenga suficientes créditos.
    """
    try:
        email_dishes_dict = []
        dishes_dict = []
        total_credits = 0

        dish_dao = dishDAO()
        dishType_dao = db_utils.dishTypeDAO()
        for ordered_dish in order_data.dishes:
            dish = dish_dao.get_by_id(ordered_dish.dish_id)
            credits = dishType_dao.get_credits_by_name(dish.dish_type)
            email_dishes_dict.append({
                "dish_name": dish.name,
                "dish_type": dish.dish_type,
                "image_url": dish.image_url,
                "credits": credits,
                "instructions": ordered_dish.instructions
            })

            total_credits += credits

            dishes_dict.append({
                "dish_name": dish.name,
                "dish_type": dish.dish_type,
                "instructions": ordered_dish.instructions
            })

        # Crear el pedido usando db_utils
        order_id = db_utils.create_order(
            client_id=client_id,
            restaurant_id=restaurant_id,
            dishes=dishes_dict
        )

        if order_id is None:
            raise ValueError("No se pudo crear el pedido. Verifica los datos.")
        
        client_dao = clientDAO()
        user_dao = userDAO()
        restaurant_dao = restaurantDAO()
        client = client_dao.get_by_id(client_id)
        if not client:
            raise ValueError(f"Client with id {client_id} not found")

        user = user_dao.get_by_id(client.user_id)
        if not user:
            raise ValueError(f"User with id {client.user_id} not found")

        restaurant = restaurant_dao.get_by_id(restaurant_id)
        if not restaurant:
            raise ValueError(f"Restaurant with id {restaurant_id} not found")

        message_id = send_order_confirmation_email(user.email, client.name, restaurant.name, email_dishes_dict, total_credits, order_id)

        # Si se generó un Message-ID, guardarlo en la base de datos
        if message_id:
            order_dao = orderDAO()
            order_dao.update(order_id, {"email_message_id": message_id})
        
        return order_id
        
    except Exception as e:
        raise e

def update_existing_order_status(order_id: int) -> int:
    """
    Actualiza el estado de un pedido existente y envía notificaciones por correo.
    """
    try:
        # 1. Actualiza el estado del pedido en la base de datos
        updated_order = db_utils.update_order_status(order_id=order_id)

        if updated_order is None:
            raise ValueError("No se pudo actualizar el estado del pedido.")

        # 3. Obtener detalles del cliente, usuario y restaurante para el correo
        client_dao = clientDAO()
        user_dao = userDAO()
        restaurant_dao = restaurantDAO()

        client = client_dao.get_by_id(updated_order.client_id)
        user = user_dao.get_by_id(client.user_id)
        restaurant = restaurant_dao.get_by_id(updated_order.restaurant_id)

        # 4. Enviar el correo electrónico según el nuevo estado del pedido
        if updated_order.order_status == 'En reparto':
            send_order_in_delivery_email(
                recipient_email=user.email,
                recipient_name=client.name,
                restaurant_name=restaurant.name,
                order_id=updated_order.id,
                original_message_id=updated_order.email_message_id
            )
        elif updated_order.order_status == 'Entregado':
            send_order_delivered_email(
                recipient_email=user.email,
                recipient_name=client.name,
                restaurant_name=restaurant.name,
                order_id=updated_order.id,
                original_message_id=updated_order.email_message_id
            )

        return updated_order.id
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e
    
def cancel_existing_order(order_id: int) -> bool:
    """
    Orquesta la cancelacion de un pedido existente.
    """
    try:
        order_id = db_utils.cancel_order(order_id)
        return order_id
    except Exception as e:
        raise e

def create_new_rating(client_id: int, restaurant_id: int, rating_data: RatingCreate) -> int:
    """
    Orquesta la creación de una nueva valoración.
    """
    try:
        rating_id = db_utils.create_rating(
            client_id=client_id,
            restaurant_id=restaurant_id,
            rating=rating_data.rating
        )
        return rating_id
    except Exception as e:
        raise e
    
def update_existing_rating(rating_id: int, rating_data: RatingUpdate) -> int:
    """
    Orquesta la actualización de una valoración existente.
    """
    # Convierte el modelo Pydantic a un diccionario.
    update_data = rating_data.model_dump(exclude_unset=True)

    # Si no se envió ningún dato para actualizar, no hacemos nada.
    if not update_data:
        return rating_id # O podrías lanzar un error si lo prefieres

    try:
        # Pasamos el ID y el diccionario de datos a la función de la base de datos.
        rating_id = db_utils.update_rating_information(
            rating_id=rating_id,
            data_to_update=update_data
        )
        return rating_id
    except Exception as e:
        # Puedes manejar o registrar el error aquí antes de relanzarlo
        raise e
    
def _upload_file_to_supabase(bucket_name: str, file_path: str, file, content_type: str) -> str:
    """
    Función genérica interna para subir un archivo a un bucket específico de Supabase.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(url, key)

    # Sube el archivo. upsert=True sobrescribe si ya existe.
    supabase.storage.from_(bucket_name).upload(
        file=file,
        path=file_path,
        file_options={"content-type": content_type, "upsert": "true"}
    )

    public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)

    if public_url.endswith('?'):
        public_url = public_url[:-1]

    # Devuelve la URL pública del archivo.
    return public_url
    
def upload_restaurant_logo(restaurant_id: int, file, content_type: str) -> str:
    """
    Sube el logo de un restaurante y actualiza la BD.
    """
    bucket_name = "restaurant-logo-images"
    file_path = f"public/logo_{restaurant_id}.{content_type.split('/')[1]}"
    
    public_url = _upload_file_to_supabase(bucket_name, file_path, file, content_type)
    
    # Actualizar la columna 'logo_url' en la tabla de restaurantes
    restaurant_dao = db_utils.restaurantDAO()
    restaurant_dao.update(restaurant_id, {"logo_url": public_url})
    
    return public_url

def upload_dish_image(dish_id: int, file, content_type: str) -> str:
    """
    Sube la imagen de un plato y actualiza la BD.
    """
    bucket_name = "dish-images"
    file_path = f"public/dish_{dish_id}.{content_type.split('/')[1]}"
    
    public_url = _upload_file_to_supabase(bucket_name, file_path, file, content_type)
    
    # Actualizar la columna 'image_url' en la tabla de platos
    dish_dao = db_utils.dishDAO()
    dish_dao.update(dish_id, {"image_url": public_url})
    
    return public_url

def upload_user_profile_picture(user_id: int, file, content_type: str) -> str:
    """
    Sube la foto de perfil de un usuario y actualiza la BD.
    """
    bucket_name = "profile-picture-images"
    file_path = f"public/user_{user_id}.{content_type.split('/')[1]}"
    
    public_url = _upload_file_to_supabase(bucket_name, file_path, file, content_type)
    
    # Actualizar la columna 'image_url' en la tabla de usuarios
    user_dao = db_utils.userDAO()
    user_dao.update(user_id, {"image_url": public_url})

    return public_url