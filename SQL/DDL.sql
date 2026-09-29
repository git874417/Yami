-- =============================================================
-- YAMI — Database Schema (PostgreSQL / Supabase)
-- Academic project — Information Systems, University of Zaragoza
-- Course 2025-2026
-- =============================================================
-- NOTE: This file describes the schema used in Supabase.
-- Before running the CREATE TABLE statements, you must create
-- the custom ENUM types defined below in your Supabase SQL editor.
-- =============================================================


-- -------------------------------------------------------------
-- SCHEMA
-- -------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS sisinf_p3;


-- -------------------------------------------------------------
-- CUSTOM ENUM TYPES
-- (Supabase exports these as USER-DEFINED — define them first)
-- -------------------------------------------------------------

-- User roles in the platform
CREATE TYPE sisinf_p3.user_role AS ENUM (
    'client',
    'restaurant',
    'admin'
);

-- Subscription plan tiers
CREATE TYPE sisinf_p3.subscription_plan_name AS ENUM (
    'Gratis',
    'Premium',
    'Elite'
);

-- Order lifecycle statuses
CREATE TYPE sisinf_p3.order_status AS ENUM (
    'Encargado',
    'En camino',
    'Entregado',
    'Cancelado'
);

-- Dish type names (also referenced as FK to DishTypes table)
CREATE TYPE sisinf_p3.dish_type_name AS ENUM (
    'Entrante',
    'Principal',
    'Postre',
    'Bebida'
);

-- Restaurant food categories
CREATE TYPE sisinf_p3.restaurant_category AS ENUM (
    'Italiana',
    'Española',
    'Japonesa',
    'Mexicana',
    'China',
    'Americana',
    'Francesa',
    'India',
    'Árabe',
    'Otro'
);


-- -------------------------------------------------------------
-- TABLES (in dependency order)
-- -------------------------------------------------------------

-- 1. Users — base authentication entity
CREATE TABLE sisinf_p3.Users (
    id          bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    email       character varying NOT NULL UNIQUE,
    password    character varying NOT NULL CHECK (length(password::text) >= 8),
    role        sisinf_p3.user_role NOT NULL,
    image_url   character varying,
    CONSTRAINT Users_pkey PRIMARY KEY (id)
);

-- 2. SubscriptionPlans — available subscription tiers
CREATE TABLE sisinf_p3.SubscriptionPlans (
    id      bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    credits bigint CHECK (credits > 0),
    name    sisinf_p3.subscription_plan_name NOT NULL UNIQUE,
    price   double precision NOT NULL,
    CONSTRAINT SubscriptionPlans_pkey PRIMARY KEY (id)
);

-- 3. DishTypes — dish categories with associated credit cost
CREATE TABLE sisinf_p3.DishTypes (
    id      bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    name    sisinf_p3.dish_type_name NOT NULL UNIQUE,
    credits bigint NOT NULL,
    CONSTRAINT DishTypes_pkey PRIMARY KEY (id)
);

-- 4. Clients — registered customers (linked to Users)
CREATE TABLE sisinf_p3.Clients (
    id                       bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    user_id                  bigint NOT NULL UNIQUE,
    name                     character varying NOT NULL,
    surname                  character varying,
    address                  character varying NOT NULL,
    city                     character varying NOT NULL,
    postal_code              character varying NOT NULL,
    dni                      character varying NOT NULL,
    phone_number             character varying NOT NULL CHECK (length(phone_number::text) < 10),
    available_credits        bigint,
    subscription_renewal_date timestamp without time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    sub_plan                 sisinf_p3.subscription_plan_name NOT NULL,
    CONSTRAINT Clients_pkey          PRIMARY KEY (id),
    CONSTRAINT Clients_user_id_fkey  FOREIGN KEY (user_id)   REFERENCES sisinf_p3.Users(id),
    CONSTRAINT clients_sub_plan_fkey FOREIGN KEY (sub_plan)  REFERENCES sisinf_p3.SubscriptionPlans(name)
);

-- 5. Restaurants — registered restaurants (linked to Users)
CREATE TABLE sisinf_p3.Restaurants (
    id           bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    user_id      bigint NOT NULL UNIQUE,
    name         character varying NOT NULL UNIQUE,
    description  character varying,
    phone_number character varying NOT NULL CHECK (length(phone_number::text) < 10),
    address      character varying NOT NULL UNIQUE,
    category     sisinf_p3.restaurant_category NOT NULL,
    city         character varying NOT NULL,
    logo_url     character varying,
    CONSTRAINT Restaurants_pkey         PRIMARY KEY (id),
    CONSTRAINT Restaurants_user_id_fkey FOREIGN KEY (user_id) REFERENCES sisinf_p3.Users(id)
);

-- 6. Dishes — menu items belonging to a restaurant
CREATE TABLE sisinf_p3.Dishes (
    id            bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    restaurant_id bigint NOT NULL,
    name          character varying NOT NULL,
    description   character varying,
    allergens     character varying,
    dish_type     sisinf_p3.dish_type_name NOT NULL,
    image_url     character varying,
    CONSTRAINT Dishes_pkey              PRIMARY KEY (id),
    CONSTRAINT Dishes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES sisinf_p3.Restaurants(id),
    CONSTRAINT dishes_dish_type_fkey    FOREIGN KEY (dish_type)      REFERENCES sisinf_p3.DishTypes(name)
);

-- 7. Ratings — client ratings for restaurants
CREATE TABLE sisinf_p3.Ratings (
    id            bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    client_id     bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    rating        bigint CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT Ratings_pkey               PRIMARY KEY (id),
    CONSTRAINT Ratings_client_id_fkey     FOREIGN KEY (client_id)     REFERENCES sisinf_p3.Clients(id),
    CONSTRAINT Ratings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES sisinf_p3.Restaurants(id)
);

-- 8. Orders — food orders placed by clients
CREATE TABLE sisinf_p3.Orders (
    id               bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    client_id        bigint NOT NULL,
    restaurant_id    bigint NOT NULL,
    order_credits    bigint CHECK (order_credits >= 0),
    order_date       timestamp without time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    order_status     sisinf_p3.order_status NOT NULL DEFAULT 'Encargado'::sisinf_p3.order_status,
    email_message_id character varying,
    CONSTRAINT Orders_pkey               PRIMARY KEY (id),
    CONSTRAINT Orders_client_id_fkey     FOREIGN KEY (client_id)     REFERENCES sisinf_p3.Clients(id),
    CONSTRAINT Orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES sisinf_p3.Restaurants(id)
);

-- 9. OrderedDishes — individual dishes within an order
CREATE TABLE sisinf_p3.OrderedDishes (
    id           bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    order_id     bigint NOT NULL,
    dish_id      bigint,
    dish_name    character varying,
    instructions character varying,
    CONSTRAINT OrderedDishes_pkey         PRIMARY KEY (id),
    CONSTRAINT OrderedDishes_order_id_fkey FOREIGN KEY (order_id) REFERENCES sisinf_p3.Orders(id),
    CONSTRAINT OrderedDishes_dish_id_fkey  FOREIGN KEY (dish_id)  REFERENCES sisinf_p3.Dishes(id)
);
