-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE sisinf_p3.Clients (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL UNIQUE,
  name character varying NOT NULL,
  surname character varying,
  address character varying NOT NULL,
  city character varying NOT NULL,
  postal_code character varying NOT NULL,
  dni character varying NOT NULL,
  phone_number character varying NOT NULL CHECK (length(phone_number::text) < 10),
  available_credits bigint,
  subscription_renewal_date timestamp without time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  sub_plan USER-DEFINED NOT NULL,
  CONSTRAINT Clients_pkey PRIMARY KEY (id),
  CONSTRAINT Clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES sisinf_p3.Users(id),
  CONSTRAINT clients_sub_plan_fkey FOREIGN KEY (sub_plan) REFERENCES sisinf_p3.SubscriptionPlans(name)
);
CREATE TABLE sisinf_p3.Dishes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  restaurant_id bigint NOT NULL,
  name character varying NOT NULL,
  description character varying,
  allergens character varying,
  dish_type USER-DEFINED NOT NULL,
  CONSTRAINT Dishes_pkey PRIMARY KEY (id),
  CONSTRAINT Dishes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES sisinf_p3.Restaurants(id)
);
CREATE TABLE sisinf_p3.OrderedDishes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint NOT NULL,
  dish_id bigint NOT NULL,
  dish_name character varying,
  instructions character varying,
  CONSTRAINT OrderedDishes_pkey PRIMARY KEY (id),
  CONSTRAINT OrderedDishes_dish_id_fkey FOREIGN KEY (dish_id) REFERENCES sisinf_p3.Dishes(id),
  CONSTRAINT OrderedDishes_order_id_fkey FOREIGN KEY (order_id) REFERENCES sisinf_p3.Orders(id)
);
CREATE TABLE sisinf_p3.Orders (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  client_id bigint NOT NULL,
  restaurant_id bigint NOT NULL,
  order_credits bigint CHECK (order_credits >= 0),
  order_date timestamp without time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT Orders_pkey PRIMARY KEY (id),
  CONSTRAINT Orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES sisinf_p3.Clients(id),
  CONSTRAINT Orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES sisinf_p3.Restaurants(id)
);
CREATE TABLE sisinf_p3.Ratings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  client_id bigint NOT NULL,
  restaurant_id bigint NOT NULL UNIQUE,
  rating bigint CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT Ratings_pkey PRIMARY KEY (id),
  CONSTRAINT Ratings_client_id_fkey FOREIGN KEY (client_id) REFERENCES sisinf_p3.Clients(id),
  CONSTRAINT Ratings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES sisinf_p3.Restaurants(id)
);
CREATE TABLE sisinf_p3.Restaurants (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL UNIQUE,
  name character varying NOT NULL UNIQUE,
  description character varying,
  phone_number character varying NOT NULL CHECK (length(phone_number::text) < 10),
  address character varying NOT NULL UNIQUE,
  category character varying NOT NULL,
  city character varying NOT NULL,
  CONSTRAINT Restaurants_pkey PRIMARY KEY (id),
  CONSTRAINT Restaurants_user_id_fkey FOREIGN KEY (user_id) REFERENCES sisinf_p3.Users(id)
);
CREATE TABLE sisinf_p3.SubscriptionPlans (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  credits bigint CHECK (credits > 0),
  name USER-DEFINED NOT NULL UNIQUE,
  CONSTRAINT SubscriptionPlans_pkey PRIMARY KEY (id)
);
CREATE TABLE sisinf_p3.Users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL CHECK (length(password::text) >= 8),
  role USER-DEFINED NOT NULL,
  CONSTRAINT Users_pkey PRIMARY KEY (id)
);