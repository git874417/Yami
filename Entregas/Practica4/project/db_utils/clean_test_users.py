"""
Script para limpiar los usuarios de prueba creados.
"""

import sys
import os

# Añadir la raíz del proyecto al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from project.db_utils.userDAO import userDAO

def clean_test_users():
    """Elimina los usuarios de test creados por el script populate_database.py"""
    
    user_dao = userDAO()
    
    test_emails = [
        "la_bella_italia@yami.com",
        "sushi_master@yami.com",
        "tacos_&_más@yami.com",
        "burger_house@yami.com",
        "wok_express@yami.com",
        "la_parrilla_argentina@yami.com",
        "spice_of_india@yami.com",
        "le_petit_bistro@yami.com",
        "mediterranean_grill@yami.com",
        "thai_street_food@yami.com"
    ]
    
    print("🧹 Limpiando usuarios de prueba...")
    print("=" * 60)
    
    deleted_count = 0
    for email in test_emails:
        try:
            user = user_dao.get_by_email(email)
            if user:
                user_dao.delete(user.id)
                print(f"  ✓ Usuario eliminado: {email}")
                deleted_count += 1
            else:
                print(f"  ⊘ Usuario no encontrado: {email}")
        except Exception as e:
            print(f"  ✗ Error eliminando {email}: {e}")
    
    print("=" * 60)
    print(f"✅ Limpieza completada. {deleted_count} usuarios eliminados.")

if __name__ == "__main__":
    clean_test_users()
