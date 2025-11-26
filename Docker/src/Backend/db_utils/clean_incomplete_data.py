import sys
import os

# Añadir la carpeta raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from db_utils.dishDAO import dishDAO
from db_utils.restaurantDAO import restaurantDAO
from db_utils.userDAO import userDAO

def clean_incomplete_data():
    """
    Elimina platos sin imagen_url, restaurantes sin logo_url y sus usuarios asociados.
    """
    dish_dao = dishDAO()
    restaurant_dao = restaurantDAO()
    user_dao = userDAO()
    
    print("=" * 60)
    print("LIMPIANDO DATOS INCOMPLETOS")
    print("=" * 60)
    
    # 1. Obtener todos los platos sin imagen
    try:
        result = dish_dao.supabase.table("Dishes").select("*").is_("image_url", "null").execute()
        dishes_without_image = result.data
        
        if dishes_without_image:
            print(f"\n🗑️  Encontrados {len(dishes_without_image)} platos sin imagen")
            
            # Obtener IDs de restaurantes únicos
            restaurant_ids = set(dish['restaurant_id'] for dish in dishes_without_image)
            
            # Eliminar platos
            for dish in dishes_without_image:
                dish_dao.delete(dish['id'])
                print(f"  ✓ Eliminado plato: {dish['name']} (ID: {dish['id']})")
            
            print(f"\n🗑️  Eliminando {len(restaurant_ids)} restaurantes asociados...")
            
            # Eliminar restaurantes y sus usuarios
            for rest_id in restaurant_ids:
                try:
                    restaurant = restaurant_dao.get_by_id(rest_id)
                    if restaurant:
                        # Eliminar restaurante
                        restaurant_dao.delete(rest_id)
                        print(f"  ✓ Eliminado restaurante ID: {rest_id}")
                        
                        # Eliminar usuario asociado
                        if restaurant.user_id:
                            user_dao.delete(restaurant.user_id)
                            print(f"    ✓ Eliminado usuario ID: {restaurant.user_id}")
                except Exception as e:
                    print(f"  ✗ Error eliminando restaurante {rest_id}: {e}")
        else:
            print("\n✓ No se encontraron platos sin imagen")
            
    except Exception as e:
        print(f"\n✗ Error al limpiar datos: {e}")
    
    # 2. Limpiar restaurantes huérfanos sin logo
    try:
        result = restaurant_dao.supabase.table("Restaurants").select("*").is_("logo_url", "null").execute()
        restaurants_without_logo = result.data
        
        if restaurants_without_logo:
            print(f"\n🗑️  Encontrados {len(restaurants_without_logo)} restaurantes sin logo")
            
            for rest in restaurants_without_logo:
                try:
                    # Eliminar platos del restaurante
                    dishes = dish_dao.get_all_from_restaurant(rest['id'])
                    for dish in dishes:
                        dish_dao.delete(dish.id)
                    
                    # Eliminar restaurante
                    restaurant_dao.delete(rest['id'])
                    print(f"  ✓ Eliminado restaurante: {rest['name']} (ID: {rest['id']})")
                    
                    # Eliminar usuario
                    if rest['user_id']:
                        user_dao.delete(rest['user_id'])
                        print(f"    ✓ Eliminado usuario ID: {rest['user_id']}")
                except Exception as e:
                    print(f"  ✗ Error: {e}")
        else:
            print("\n✓ No se encontraron restaurantes sin logo")
            
    except Exception as e:
        print(f"\n✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ LIMPIEZA COMPLETADA")
    print("=" * 60)

if __name__ == "__main__":
    clean_incomplete_data()
