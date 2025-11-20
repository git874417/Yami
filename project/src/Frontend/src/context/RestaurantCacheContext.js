import React, { createContext, useContext, useState } from "react";

const RestaurantCacheContext = createContext();

export const RestaurantCacheProvider = ({ children }) => {
  const [restaurantCache, setRestaurantCache] = useState({});
  const [dishesCacheData, setDishesCacheData] = useState({});
  const [restaurantsList, setRestaurantsList] = useState(null);
  const [restaurantsListTimestamp, setRestaurantsListTimestamp] = useState(null);

  const setRestaurantData = (restaurantId, restaurantData, dishesData) => {
    setRestaurantCache(prev => ({
      ...prev,
      [restaurantId]: restaurantData
    }));
    setDishesCacheData(prev => ({
      ...prev,
      [restaurantId]: dishesData
    }));
  };

  const getRestaurantData = (restaurantId) => {
    return {
      restaurant: restaurantCache[restaurantId],
      dishes: dishesCacheData[restaurantId]
    };
  };

  const cacheDishes = (restaurantId, dishesData) => {
    setDishesCacheData(prev => ({
      ...prev,
      [restaurantId]: dishesData
    }));
  };

  const getCachedDishes = (restaurantId) => {
    return dishesCacheData[restaurantId];
  };

  const clearRestaurantCache = (restaurantId) => {
    setRestaurantCache(prev => {
      const newCache = { ...prev };
      delete newCache[restaurantId];
      return newCache;
    });
    setDishesCacheData(prev => {
      const newCache = { ...prev };
      delete newCache[restaurantId];
      return newCache;
    });
  };

  const setRestaurantsListCache = (restaurants) => {
    setRestaurantsList(restaurants);
    setRestaurantsListTimestamp(Date.now());
  };

  const getRestaurantsListCache = () => {
    return restaurantsList;
  };

  const clearRestaurantsListCache = () => {
    setRestaurantsList(null);
    setRestaurantsListTimestamp(null);
  };

  return (
    <RestaurantCacheContext.Provider
      value={{
        setRestaurantData,
        getRestaurantData,
        clearRestaurantCache,
        setRestaurantsListCache,
        getRestaurantsListCache,
        clearRestaurantsListCache,
        cacheDishes,
        getCachedDishes
      }}
    >
      {children}
    </RestaurantCacheContext.Provider>
  );
};

export const useRestaurantCache = () => {
  const context = useContext(RestaurantCacheContext);
  if (!context) {
    throw new Error("useRestaurantCache debe usarse dentro de RestaurantCacheProvider");
  }
  return context;
};
