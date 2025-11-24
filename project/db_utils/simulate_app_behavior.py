"""
Script para simular comportamiento realista de la aplicación Foodflix.
Crea pedidos de clientes a diferentes restaurantes y simula el avance de estados.
No modifica datos existentes, solo crea nuevos pedidos de prueba.
"""

import sys
import os
import random
import time
from datetime import datetime

# Añadir la raíz del proyecto al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from project.db_utils.userDAO import userDAO
from project.db_utils.clientDAO import clientDAO
from project.db_utils.restaurantDAO import restaurantDAO
from project.db_utils.dishDAO import dishDAO
from project.db_utils.orderDAO import orderDAO
from project.src.Backend.services import create_new_order, update_existing_order_status, cancel_existing_order
from project.src.Backend.model import OrderCreate, DishOrder

def simulate_app_behavior():
    """
    Simula comportamiento realista de la aplicación creando pedidos y avanzando estados.
    """
    print("🍽️  Simulando comportamiento de Yami...")
    print("=" * 80)

    try:
        # Obtener DAOs
        user_dao = userDAO()
        client_dao = clientDAO()
        restaurant_dao = restaurantDAO()
        dish_dao = dishDAO()
        order_dao = orderDAO()

        # 1. Obtener clientes existentes (excluyendo los de prueba que terminan en @yami.com)
        print("👥 Obteniendo clientes existentes...")
        all_users = user_dao.get_all()
        clients = []

        for user in all_users:
            if user.role == "Client":
                try:
                    # Buscar el cliente correspondiente
                    client = client_dao.get_by_user_id(user.id)
                    if client and not user.email.endswith('@yami.com'):  # Excluir restaurantes de prueba
                        clients.append((user, client))
                except Exception:
                    # Si no existe el cliente, continuar
                    continue

        if len(clients) < 2:
            print("❌ Se necesitan al menos 2 clientes reales para la simulación.")
            return

        print(f"✅ Encontrados {len(clients)} clientes reales")

        # 2. Obtener restaurantes existentes
        print("\n🏪 Obteniendo restaurantes...")
        restaurants = []

        for user in all_users:
            if user.role == "Restaurant":
                restaurant = restaurant_dao.get_by_user_id(user.id)
                if restaurant:
                    restaurants.append((user, restaurant))

        if len(restaurants) < 3:
            print("❌ Se necesitan al menos 3 restaurantes para la simulación.")
            return

        print(f"✅ Encontrados {len(restaurants)} restaurantes")

        # 3. Crear pedidos simulados
        print("\n📋 Creando pedidos simulados...")

        # Seleccionar algunos clientes y restaurantes para la simulación
        selected_clients = random.sample(clients, min(8, len(clients)))  # Más clientes
        selected_restaurants = random.sample(restaurants, min(10, len(restaurants)))  # Más restaurantes

        created_orders = []
        cancelled_orders = []

        for i, (client_user, client) in enumerate(selected_clients, 1):
            print(f"\n  👤 Cliente {i}: {client_user.email} ({client.name})")

            # Cada cliente hace pedidos a 3-5 restaurantes diferentes
            client_restaurants = random.sample(selected_restaurants, random.randint(3, min(5, len(selected_restaurants))))

            for restaurant_user, restaurant in client_restaurants:
                print(f"    🛒 Pidiendo en: {restaurant.name} ({restaurant.category})")

                # Obtener platos disponibles del restaurante
                try:
                    restaurant_dishes = dish_dao.get_all_from_restaurant(restaurant.id)
                    if not restaurant_dishes:
                        print("      ⚠️  Restaurante sin platos disponibles, saltando...")
                        continue

                    # Seleccionar 1-3 platos aleatorios
                    num_dishes = random.randint(1, min(3, len(restaurant_dishes)))
                    selected_dishes = random.sample(restaurant_dishes, num_dishes)

                    # Crear el pedido
                    order_dishes = []
                    for dish in selected_dishes:
                        order_dishes.append(DishOrder(
                            dish_id=dish.id,
                            instructions=f"Instrucciones para {dish.name}" if random.choice([True, False]) else ""
                        ))

                    order_data = OrderCreate(dishes=order_dishes)

                    # Crear el pedido
                    order_id = create_new_order(client.id, restaurant.id, order_data)

                    if order_id:
                        print(f"      ✅ Pedido #{order_id} creado con {len(order_dishes)} platos")
                        created_orders.append({
                            'order_id': order_id,
                            'client': client,
                            'restaurant': restaurant,
                            'dishes': selected_dishes
                        })
                    else:
                        print("      ❌ Error al crear el pedido")

                except Exception as e:
                    print(f"      ❌ Error creando pedido: {e}")

        # 4. Simular avance de estados de pedidos
        if created_orders:
            print("\n🚀 Avanzando estados de pedidos...")
            print(f"   Simulando {len(created_orders)} pedidos")

            for order_info in created_orders:
                order_id = order_info['order_id']
                client = order_info['client']
                restaurant = order_info['restaurant']

                print(f"\n  📦 Pedido #{order_id} - {restaurant.name}")

                # 20% de probabilidad de cancelar el pedido antes de que se complete
                if random.random() < 0.20:  # 20% de cancelación
                    try:
                        cancel_result = cancel_existing_order(order_id)
                        if cancel_result:
                            print("    ❌ Pedido cancelado por el cliente")
                            cancelled_orders.append(order_info)
                            continue  # Saltar al siguiente pedido
                        else:
                            print("    ⚠️  Error al cancelar el pedido, continuando con el proceso normal")
                    except Exception as e:
                        print(f"    ⚠️  Error al cancelar pedido: {e}, continuando con el proceso normal")

                # Simular progreso del pedido con delays realistas
                states = [
                    ("En preparación", "👨‍🍳 El restaurante está preparando tu pedido"),
                    ("En reparto", "🚴 Tu pedido está en camino"),
                    ("Entregado", "✅ ¡Pedido entregado!")
                ]

                for state, message in states:
                    try:
                        # Avanzar el estado
                        updated_id = update_existing_order_status(order_id)
                        print(f"    {message}")

                        # Esperar un poco entre estados (simulando tiempo real)
                        if state != "Entregado":  # No esperar después del último estado
                            time.sleep(1)  # 1 segundo entre estados

                    except Exception as e:
                        print(f"    ❌ Error avanzando estado a '{state}': {e}")
                        break

        # 5. Resumen final
        print("\n" + "=" * 80)
        print("🎉 ¡Simulación completada!")
        print(f"📊 Resumen:")
        print(f"  • Clientes participantes: {len(selected_clients)}")
        print(f"  • Restaurantes participantes: {len(selected_restaurants)}")
        print(f"  • Pedidos creados: {len(created_orders)}")
        print(f"  • Pedidos cancelados: {len(cancelled_orders)}")
        print(f"  • Pedidos completados: {len(created_orders) - len(cancelled_orders)}")
        print(f"  • Estados avanzados: {(len(created_orders) - len(cancelled_orders)) * 3} (preparación → reparto → entregado)")

        if created_orders:
            completed_orders = len(created_orders) - len(cancelled_orders)
            print(f"\n✅ Simulación completada exitosamente!")
            print(f"   • {len(created_orders)} pedidos creados")
            print(f"   • {len(cancelled_orders)} pedidos cancelados")
            print(f"   • {completed_orders} pedidos completados con entregas exitosas")
            print("   Los clientes han recibido confirmaciones por email.")
            print("   Los restaurantes han procesado todos los pedidos activos.")

    except Exception as e:
        print(f"❌ Error en la simulación: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simulate_app_behavior()