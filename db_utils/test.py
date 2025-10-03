#Codigo para probar la base de datos
import db_utils
def test_db():
    db_utils.create_client("alice@example.com", "alicepass", "Plus", "Alice", "Smith", "456 Elm St", "Springfield", "54321", "87654321B", "987654321")
    db_utils.create_client("bob@example.com", "bobpass2", "Basic", "Bob", "Johnson", "789 Oak Ave", "Shelbyville", "67890", "11223344C", "122334455")
    db_utils.create_client("carol@example.com", "carolpass", "Deluxe", "Carol", "Williams", "321 Pine Rd", "Ogdenville", "98765", "55667788D", "677889900")

    db_utils.create_restaurant("restaurant@example.com", "restauranpass", "BatPizza", "Delicious pizzas", "Gotham", "123 Pizza St", "45678901A", "Italiano")
    db_utils.create_restaurant("restaurant2@example.com", "restauranpass2", "SuperTacos", "Spicy tacos", "Metropolis", "456 Taco Blvd", "98765432B", "Mexicano")
    db_utils.create_restaurant("restaurant3@example.com", "restauranpass3", "FlashNoodles", "Tasty noodles", "Star City", "789 Noodle Ln", "13579246C", "Asiático")

    db_utils.create_dish(1, "Margherita", "Classic pizza with tomatoes and cheese", "Gluten", "Principal")
    db_utils.create_dish(1, "Pepperoni", "Spicy pepperoni pizza", "Gluten", "Principal")
    db_utils.create_dish(2, "Beef Taco", "Taco with seasoned beef", "Gluten", "Principal")

    db_utils.create_order(10, 1, 20, [{"dish_name": "Margherita", "instructions": "Extra cheese"}, {"dish_name": "Pepperoni", "instructions": ""}])
    db_utils.create_order(11, 2, 10, [{"dish_name": "Beef Taco", "instructions": "No onions"}])
    db_utils.create_order(12, 1, 10, [{"dish_name": "Margherita", "instructions": "Gluten-free crust"}])

test_db()