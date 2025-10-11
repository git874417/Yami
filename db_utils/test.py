#Codigo para probar la base de datos
import db_utils
def test_db():
    id_alice = db_utils.create_client("alice@example.com", "alicepass", "Plus", "Alice", "Smith", "456 Elm St", "Springfield", "54321", "87654321B", "987654321")
    id_bob = db_utils.create_client("bob@example.com", "bobpass2", "Basic", "Bob", "Johnson", "789 Oak Ave", "Shelbyville", "67890", "11223344C", "122334455")
    id_carol = db_utils.create_client("carol@example.com", "carolpass", "Deluxe", "Carol", "Williams", "321 Pine Rd", "Ogdenville", "98765", "55667788D", "677889900")

    id_restaurant1 = db_utils.create_restaurant("restaurant@example.com", "restauranpass", "BatPizza", "Delicious pizzas", "Gotham", "123 Pizza St", "45678901A", "Italiano")
    id_restaurant2 = db_utils.create_restaurant("restaurant2@example.com", "restauranpass2", "SuperTacos", "Spicy tacos", "Metropolis", "456 Taco Blvd", "98765432B", "Mexicano")
    id_restaurant3 = db_utils.create_restaurant("restaurant3@example.com", "restauranpass3", "FlashNoodles", "Tasty noodles", "Star City", "789 Noodle Ln", "13579246C", "Asiático")

    id_dish1 = db_utils.create_dish(id_restaurant1, "Margherita", "Classic pizza with tomatoes and cheese", "Gluten", "Principal")
    id_dish2 = db_utils.create_dish(id_restaurant1, "Pepperoni", "Spicy pepperoni pizza", "Gluten", "Principal")
    id_dish3 = db_utils.create_dish(id_restaurant2, "Beef Taco", "Taco with seasoned beef", "Gluten", "Principal")

    order_id1 = db_utils.create_order(id_alice, id_restaurant1, 20, [{"dish_name": "Margherita", "instructions": "Extra cheese"}, {"dish_name": "Pepperoni", "instructions": ""}])
    order_id2 = db_utils.create_order(id_bob, id_restaurant2, 10, [{"dish_name": "Beef Taco", "instructions": "No onions"}])
    order_id3 = db_utils.create_order(id_carol, id_restaurant1, 10, [{"dish_name": "Margherita", "instructions": "Gluten-free crust"}])

test_db()