# Usar una imagen base de Node.js
FROM node:20-alpine

# Crear y cambiar a un directorio de trabajo
WORKDIR /usr/src/app

# Copiar los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias, incluyendo devDependencies
RUN npm install

# Exponer el puerto en el que corre NestJS (definido por tu app)
EXPOSE 3000

# Comando para ejecutar la aplicación en modo desarrollo
CMD ["npm", "run", "start:dev"]
