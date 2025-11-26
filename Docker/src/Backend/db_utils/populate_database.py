"""
Script para poblar la base de datos con 10 restaurantes y 10 platos cada uno.
Cada plato tendrá una imagen y descripción adecuada.
"""

import sys
import os

# Añadir la raíz del proyecto al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from db_utils.userDAO import userDAO
from db_utils.userVO import userVO
from db_utils.restaurantDAO import restaurantDAO
from db_utils.restaurantVO import restaurantVO
from db_utils.dishDAO import dishDAO
from db_utils.dishVO import dishVO

def create_restaurants_and_dishes():
    """Crea 10 restaurantes con 10 platos cada uno"""
    
    user_dao = userDAO()
    restaurant_dao = restaurantDAO()
    dish_dao = dishDAO()
    
    # Definición de restaurantes
    restaurants_data = [
        {
            "name": "La Bella Italia",
            "description": "Auténtica cocina italiana con recetas tradicionales de la Toscana",
            "city": "Madrid",
            "address": "Calle Gran Vía 45",
            "phone_number": "910123456",
            "category": "Italiano",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=italiano&backgroundColor=ffdfbf"
        },
        {
            "name": "Sushi Master",
            "description": "Sushi fresco y cocina japonesa de alta calidad",
            "city": "Barcelona",
            "address": "Paseo de Gracia 78",
            "phone_number": "932456789",
            "category": "Asiático",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=sushi&backgroundColor=ffcdd2"
        },
        {
            "name": "Tacos & Más",
            "description": "Sabores auténticos de México en cada bocado",
            "city": "Valencia",
            "address": "Calle Colón 23",
            "phone_number": "963789012",
            "category": "Mexicano",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=tacos&backgroundColor=ffeb3b"
        },
        {
            "name": "Burger House",
            "description": "Las mejores hamburguesas gourmet de la ciudad",
            "city": "Sevilla",
            "address": "Avenida de la Constitución 12",
            "phone_number": "954321098",
            "category": "Comida Rapida",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=burger&backgroundColor=ff9800"
        },
        {
            "name": "Wok Express",
            "description": "Cocina china rápida y deliciosa",
            "city": "Málaga",
            "address": "Calle Larios 34",
            "phone_number": "951234567",
            "category": "Asiático",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=wok&backgroundColor=ef5350"
        },
        {
            "name": "La Parrilla Argentina",
            "description": "Carnes a la parrilla al estilo argentino",
            "city": "Bilbao",
            "address": "Gran Vía Don Diego López de Haro 56",
            "phone_number": "944567890",
            "category": "Asador",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=parrilla&backgroundColor=8d6e63"
        },
        {
            "name": "Spice of India",
            "description": "Especias y sabores auténticos de la India",
            "city": "Madrid",
            "address": "Calle Alcalá 89",
            "phone_number": "915678901",
            "category": "Indio",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=india&backgroundColor=ffb74d"
        },
        {
            "name": "Le Petit Bistro",
            "description": "Cocina francesa elegante y refinada, fusionada con bocatería al siguiente nivel",
            "city": "Barcelona",
            "address": "Rambla Catalunya 67",
            "phone_number": "933890123",
            "category": "Italiano",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=bistro&backgroundColor=ce93d8"
        },
        {
            "name": "Mediterranean Grill",
            "description": "Sabores del Mediterráneo con productos frescos",
            "city": "Alicante",
            "address": "Explanada de España 15",
            "phone_number": "965234678",
            "category": "Griego",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=greek&backgroundColor=81d4fa"
        },
        {
            "name": "Thai Street Food",
            "description": "Auténtica comida callejera tailandesa",
            "city": "Zaragoza",
            "address": "Paseo Independencia 45",
            "phone_number": "976345789",
            "category": "Asiático",
            "logo_url": "https://api.dicebear.com/7.x/bottts/svg?seed=thai&backgroundColor=aed581"
        }
    ]
    
    # Platos por restaurante (10 platos cada uno: 3 entrantes, 5 principales, 2 postres)
    dishes_by_restaurant = {
        "La Bella Italia": [
            # Entrantes
            {"name": "Bruschetta al Pomodoro", "description": "Pan tostado con tomate fresco, albahaca y aceite de oliva", "allergens": "Gluten", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f"},
            {"name": "Carpaccio de Ternera", "description": "Finas láminas de ternera con rúcula, parmesano y limón", "allergens": "Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1590759668628-05b5eae5d326"},
            {"name": "Ensalada Caprese", "description": "Tomate, mozzarella fresca, albahaca y aceite de oliva", "allergens": "Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1608897013039-887f21d8c804"},
            # Principales
            {"name": "Pizza Margherita", "description": "Pizza clásica con tomate, mozzarella y albahaca fresca", "allergens": "Gluten, Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"},
            {"name": "Lasagna Bolognesa", "description": "Capas de pasta con ragú de carne y bechamel", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1619895092538-128341789043"},
            {"name": "Risotto ai Funghi", "description": "Arroz cremoso con setas variadas y parmesano", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1476124369491-18f9235ba1d6"},
            {"name": "Spaghetti Carbonara", "description": "Pasta con huevo, panceta, parmesano y pimienta negra", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1612874742237-6526221588e3"},
            {"name": "Ossobuco alla Milanese", "description": "Jarrete de ternera estofado con gremolata", "allergens": "Gluten, Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1600891964092-4316c288032e"},
            # Postres
            {"name": "Tiramisú", "description": "Postre italiano con café, mascarpone y cacao", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9"},
            {"name": "Panna Cotta", "description": "Crema italiana con coulis de frutos rojos", "allergens": "Lactosa", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1488477181946-6428a0291777"},
        ],
        "Sushi Master": [
            # Entrantes
            {"name": "Edamame", "description": "Vainas de soja al vapor con sal marina", "allergens": "Soja", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1600628421055-4044aa5f4d1f"},
            {"name": "Gyoza de Cerdo", "description": "Empanadillas japonesas rellenas de cerdo y vegetales", "allergens": "Gluten, Soja", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb"},
            {"name": "Ensalada Wakame", "description": "Alga wakame con sésamo y vinagreta japonesa", "allergens": "Soja", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"},
            # Principales
            {"name": "Sushi Variado (12 piezas)", "description": "Selección de nigiri y maki con pescado fresco", "allergens": "Pescado, Soja, Gluten", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351"},
            {"name": "Sashimi Deluxe", "description": "Láminas de pescado crudo de máxima calidad", "allergens": "Pescado", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56"},
            {"name": "Ramen Tonkotsu", "description": "Fideos en caldo de hueso de cerdo con chashu", "allergens": "Gluten, Huevo, Soja", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624"},
            {"name": "Udon con Tempura", "description": "Fideos gruesos con langostinos en tempura", "allergens": "Gluten, Marisco", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3"},
            {"name": "Poke Bowl de Salmón", "description": "Arroz con salmón marinado, aguacate y edamame", "allergens": "Pescado, Soja", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"},
            # Postres
            {"name": "Mochi de Té Verde", "description": "Dulce japonés de arroz glutinoso relleno", "allergens": "Soja", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1582716401301-b2407dc7563d"},
            {"name": "Dorayaki", "description": "Tortitas japonesas rellenas de pasta de judía roja", "allergens": "Gluten, Huevo, Soja", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9"},
        ],
        "Tacos & Más": [
            # Entrantes
            {"name": "Guacamole con Nachos", "description": "Aguacate fresco con totopos de maíz crujientes", "allergens": "", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1601924582970-9238bcb495d9"},
            {"name": "Quesadilla de Queso", "description": "Tortilla de harina con queso fundido", "allergens": "Gluten, Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1618040996337-56904b7850b9"},
            {"name": "Jalapeños Rellenos", "description": "Pimientos jalapeños con queso crema", "allergens": "Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32"},
            # Principales
            {"name": "Tacos al Pastor", "description": "Tres tacos con cerdo marinado, piña y cilantro", "allergens": "Gluten", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47"},
            {"name": "Burrito Supremo", "description": "Tortilla rellena de carne, frijoles, arroz y guacamole", "allergens": "Gluten, Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f"},
            {"name": "Enchiladas Verdes", "description": "Tortillas de maíz con pollo en salsa verde", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f"},
            {"name": "Fajitas Mixtas", "description": "Pollo y ternera con pimientos y cebolla", "allergens": "Gluten", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1545093149-618ce3bcf49d"},
            {"name": "Chiles Rellenos", "description": "Pimientos poblanos rellenos con queso gratinado", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1606503153255-59d5e46d8f9d"},
            # Postres
            {"name": "Churros con Chocolate", "description": "Churros crujientes con chocolate caliente", "allergens": "Gluten, Lactosa", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1568143500990-4e365b7d4bcb"},
            {"name": "Flan de Cajeta", "description": "Flan casero con caramelo de leche de cabra", "allergens": "Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1587314168485-3236d6710814"},
        ],
        "Burger House": [
            # Entrantes
            {"name": "Aros de Cebolla", "description": "Aros de cebolla crujientes con salsa barbacoa", "allergens": "Gluten", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1639024471283-03518883512d"},
            {"name": "Alitas BBQ", "description": "Alitas de pollo con salsa barbacoa casera", "allergens": "", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1608039755401-742074f0548d"},
            {"name": "Patatas Gajo", "description": "Patatas en gajos con piel y especias", "allergens": "", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1639024471283-03518883512d"},
            # Principales
            {"name": "Burger Clásica", "description": "Hamburguesa de ternera con lechuga, tomate y cebolla", "allergens": "Gluten, Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"},
            {"name": "Doble Cheeseburger", "description": "Doble carne con doble queso cheddar", "allergens": "Gluten, Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1550547660-d9450f859349"},
            {"name": "Bacon Burger", "description": "Hamburguesa con bacon crujiente y queso", "allergens": "Gluten, Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1553979459-d2229ba7433b"},
            {"name": "Burger BBQ", "description": "Hamburguesa con cebolla caramelizada y salsa BBQ", "allergens": "Gluten, Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1572448862527-d3c904757de6"},
            {"name": "Veggie Burger", "description": "Hamburguesa vegetariana con quinoa y vegetales", "allergens": "Gluten, Soja", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1520072959219-c595dc870360"},
            # Postres
            {"name": "Brownie con Helado", "description": "Brownie de chocolate caliente con helado de vainilla", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c"},
            {"name": "Milkshake de Oreo", "description": "Batido cremoso con galletas Oreo trituradas", "allergens": "Gluten, Lactosa", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699"},
        ],
        "Wok Express": [
            # Entrantes
            {"name": "Rollitos de Primavera", "description": "Rollitos crujientes con vegetales frescos", "allergens": "Gluten, Soja", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb"},
            {"name": "Dim Sum Variado", "description": "Selección de dumplings al vapor", "allergens": "Gluten, Marisco, Soja", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c"},
            {"name": "Ensalada China", "description": "Mix de vegetales con salsa de sésamo", "allergens": "Soja", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"},
            # Principales
            {"name": "Pollo Kung Pao", "description": "Pollo salteado con cacahuetes y pimientos", "allergens": "Soja, Nueces", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b"},
            {"name": "Ternera con Brócoli", "description": "Ternera salteada con brócoli en salsa de ostras", "allergens": "Soja, Marisco", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1603073063207-ace14d2e2e0a"},
            {"name": "Chow Mein de Cerdo", "description": "Fideos salteados con cerdo y vegetales", "allergens": "Gluten, Soja", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841"},
            {"name": "Arroz Tres Delicias", "description": "Arroz frito con jamón, huevo y guisantes", "allergens": "Huevo, Soja", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b"},
            {"name": "Pato Pekín", "description": "Pato laqueado crujiente con salsa hoisin", "allergens": "Gluten, Soja", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de"},
            # Postres
            {"name": "Plátano Frito", "description": "Plátano rebozado con miel y sésamo", "allergens": "Gluten", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e"},
            {"name": "Helado Frito", "description": "Helado rebozado servido caliente por fuera", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb"},
        ],
        "La Parrilla Argentina": [
            # Entrantes
            {"name": "Empanadas Argentinas", "description": "Empanadas criollas de carne picada", "allergens": "Gluten", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1601000938365-f182d70fde8c"},
            {"name": "Provoleta", "description": "Queso provolone a la parrilla con orégano", "allergens": "Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32"},
            {"name": "Chorizo Criollo", "description": "Chorizo argentino a la parrilla", "allergens": "", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47"},
            # Principales
            {"name": "Bife de Chorizo", "description": "Chuletón de ternera de 400g a la parrilla", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1558030006-450675393462"},
            {"name": "Asado de Tira", "description": "Costillas de ternera a la parrilla argentina", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1544025162-d76694265947"},
            {"name": "Entraña", "description": "Corte argentino de ternera jugoso y tierno", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba"},
            {"name": "Milanesa Napolitana", "description": "Filete empanado con jamón, tomate y queso", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8"},
            {"name": "Parrillada Mixta", "description": "Selección de carnes variadas para compartir", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1"},
            # Postres
            {"name": "Flan Casero", "description": "Flan argentino con dulce de leche", "allergens": "Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1587314168485-3236d6710814"},
            {"name": "Panqueque con Dulce de Leche", "description": "Crêpe relleno de dulce de leche", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1528207776546-365bb710ee93"},
        ],
        "Spice of India": [
            # Entrantes
            {"name": "Samosas Vegetales", "description": "Empanadillas indias rellenas de patata y guisantes", "allergens": "Gluten", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950"},
            {"name": "Pakoras Mixtas", "description": "Vegetales rebozados en harina de garbanzos", "allergens": "Gluten", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84"},
            {"name": "Naan con Ajo", "description": "Pan indio con mantequilla y ajo", "allergens": "Gluten, Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950"},
            # Principales
            {"name": "Pollo Tikka Masala", "description": "Pollo en salsa cremosa de tomate y especias", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641"},
            {"name": "Cordero Vindaloo", "description": "Cordero en salsa picante con patatas", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe"},
            {"name": "Biryani de Pollo", "description": "Arroz basmati con pollo especiado", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"},
            {"name": "Palak Paneer", "description": "Queso indio en curry de espinacas", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950"},
            {"name": "Dal Makhani", "description": "Lentejas negras en salsa cremosa", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe"},
            # Postres
            {"name": "Gulab Jamun", "description": "Bolitas dulces en almíbar de cardamomo", "allergens": "Gluten, Lactosa", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32"},
            {"name": "Kheer", "description": "Arroz con leche especiado con cardamomo", "allergens": "Lactosa", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1488477181946-6428a0291777"},
        ],
        "Le Petit Bistro": [
            # Entrantes
            {"name": "Sopa de Cebolla", "description": "Sopa gratinada con queso gruyere", "allergens": "Gluten, Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd"},
            {"name": "Escargots de Borgoña", "description": "Caracoles con mantequilla de ajo y perejil", "allergens": "Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1590759668628-05b5eae5d326"},
            {"name": "Paté de Foie", "description": "Paté de hígado con pan tostado", "allergens": "Gluten, Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f"},
            # Principales
            {"name": "Coq au Vin", "description": "Pollo guisado en vino tinto con champiñones", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6"},
            {"name": "Boeuf Bourguignon", "description": "Estofado de ternera en vino tinto", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1600891964092-4316c288032e"},
            {"name": "Magret de Pato", "description": "Pechuga de pato con salsa de naranja", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de"},
            {"name": "Ratatouille", "description": "Guiso provenzal de vegetales mediterráneos", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c"},
            {"name": "Steak Frites", "description": "Filete de ternera con patatas fritas", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1558030006-450675393462"},
            # Postres
            {"name": "Crème Brûlée", "description": "Crema quemada con azúcar caramelizado", "allergens": "Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc"},
            {"name": "Tarta Tatin", "description": "Tarta de manzana caramelizada al revés", "allergens": "Gluten, Lactosa, Huevo", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1565958011703-44f9829ba187"},
        ],
        "Mediterranean Grill": [
            # Entrantes
            {"name": "Hummus con Crudités", "description": "Crema de garbanzos con vegetales frescos", "allergens": "", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1601000938365-f182d70fde8c"},
            {"name": "Tzatziki con Pan Pita", "description": "Salsa de yogur griego con pepino", "allergens": "Gluten, Lactosa", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba"},
            {"name": "Dolmades", "description": "Hojas de parra rellenas de arroz", "allergens": "", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950"},
            # Principales
            {"name": "Moussaka", "description": "Capas de berenjena, carne y bechamel", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1619895092538-128341789043"},
            {"name": "Souvlaki de Cerdo", "description": "Brochetas de cerdo marinado con tzatziki", "allergens": "Lactosa", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba"},
            {"name": "Cordero Kleftiko", "description": "Cordero asado lentamente con limón y hierbas", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1558030006-450675393462"},
            {"name": "Paella Valenciana", "description": "Arroz con pollo, conejo y judías", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1534080564583-6be75777b70a"},
            {"name": "Pulpo a la Gallega", "description": "Pulpo cocido con pimentón y aceite", "allergens": "Marisco", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6"},
            # Postres
            {"name": "Baklava", "description": "Hojaldre con miel y frutos secos", "allergens": "Gluten, Nueces", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1519676867240-f03562e64548"},
            {"name": "Yogur Griego con Miel", "description": "Yogur espeso con miel y nueces", "allergens": "Lactosa, Nueces", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1488477181946-6428a0291777"},
        ],
        "Thai Street Food": [
            # Entrantes
            {"name": "Satay de Pollo", "description": "Brochetas de pollo con salsa de cacahuete", "allergens": "Nueces, Soja", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398"},
            {"name": "Tom Yum", "description": "Sopa picante y ácida con langostinos", "allergens": "Marisco", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd"},
            {"name": "Rollitos Frescos", "description": "Rollitos de papel de arroz con vegetales", "allergens": "", "dish_type": "Entrante", "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb"},
            # Principales
            {"name": "Pad Thai", "description": "Fideos de arroz salteados con tamarindo", "allergens": "Huevo, Nueces", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1559314809-0d155014e29e"},
            {"name": "Green Curry de Pollo", "description": "Curry verde tailandés con leche de coco", "allergens": "", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd"},
            {"name": "Massaman Curry", "description": "Curry suave con ternera y cacahuetes", "allergens": "Nueces", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe"},
            {"name": "Pad Krapow", "description": "Salteado picante con albahaca tailandesa", "allergens": "Soja", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b"},
            {"name": "Som Tam", "description": "Ensalada de papaya verde picante", "allergens": "Nueces, Marisco", "dish_type": "Principal", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"},
            # Postres
            {"name": "Mango Sticky Rice", "description": "Arroz glutinoso con mango y leche de coco", "allergens": "", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea"},
            {"name": "Banana Roti", "description": "Crepe tailandés con plátano y chocolate", "allergens": "Gluten, Huevo, Lactosa", "dish_type": "Postre", "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e"},
        ],
    }
    
    print("🍽️  Iniciando población de base de datos...")
    print("=" * 60)
    
    # Crear usuarios y restaurantes
    for i, rest_data in enumerate(restaurants_data, 1):
        try:
            print(f"\n[{i}/10] Creando restaurante: {rest_data['name']}")
            
            # Crear usuario para el restaurante
            user_email = f"{rest_data['name'].lower().replace(' ', '_')}@yami.com"
            user_vo = userVO(
                email=user_email,
                password="Restaurant123!",  # Contraseña por defecto
                role="Restaurant"
            )
            
            try:
                user_data, user_id = user_dao.insert(user_vo)
                print(f"  ✓ Usuario creado (ID: {user_id})")
            except Exception as e:
                print(f"  ✗ Error creando usuario: {e}")
                continue
            
            # Crear restaurante
            restaurant_vo = restaurantVO(
                user_id=user_id,
                name=rest_data['name'],
                description=rest_data['description'],
                city=rest_data['city'],
                address=rest_data['address'],
                phone_number=rest_data['phone_number'],
                category=rest_data['category'],
                logo_url=rest_data['logo_url']
            )
            
            try:
                rest_data_result, restaurant_id = restaurant_dao.insert(restaurant_vo)
                print(f"  ✓ Restaurante creado (ID: {restaurant_id})")
            except Exception as e:
                print(f"  ✗ Error creando restaurante: {e}")
                import traceback
                traceback.print_exc()
                continue
            
            # Crear platos para este restaurante
            dishes = dishes_by_restaurant[rest_data['name']]
            print(f"  📋 Añadiendo {len(dishes)} platos...")
            
            for j, dish_data in enumerate(dishes, 1):
                try:
                    dish_vo = dishVO(
                        restaurant_id=restaurant_id,
                        name=dish_data['name'],
                        description=dish_data['description'],
                        allergens=dish_data['allergens'],
                        dish_type=dish_data['dish_type'],
                        image_url=dish_data['image']
                    )
                    dish_result, dish_id = dish_dao.insert(dish_vo)
                    print(f"    [{j}/10] ✓ {dish_data['name']} ({dish_data['dish_type']})")
                except Exception as e:
                    print(f"    [{j}/10] ✗ Error creando plato {dish_data['name']}: {e}")
            
            print(f"  ✓ Restaurante '{rest_data['name']}' completado!")
            
        except Exception as e:
            print(f"  ✗ Error creando restaurante {rest_data['name']}: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 ¡Población de base de datos completada!")
    print("=" * 60)
    print(f"\n📊 Resumen:")
    print(f"  • Restaurantes creados: 10")
    print(f"  • Platos por restaurante: 10")
    print(f"  • Total de platos: 100")
    print(f"\n🔐 Credenciales de acceso (todos usan la misma contraseña):")
    print(f"  • Contraseña: Restaurant123!")
    print(f"\n📧 Emails de ejemplo:")
    for rest_data in restaurants_data[:3]:
        email = f"{rest_data['name'].lower().replace(' ', '_')}@yami.com"
        print(f"  • {email}")
    print(f"  • ... y 7 más")

if __name__ == "__main__":
    create_restaurants_and_dishes()
