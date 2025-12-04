# Dockerfile para el frontend: Compila con npm build y crea el contenedor
# usando nginx y alpine.

# Construcción / compilación
FROM node:16 AS build

WORKDIR /home/Docker/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   

# Servidor Web (Nginx)
FROM nginx:alpine

# Copia los archivos construidos al directorio de Nginx
COPY --from=build /home/Docker/app/build /usr/share/nginx/html

#Fichero nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

#también se podría usar con npm start
CMD ["nginx", "-g", "daemon off;"]