# FROM node:10.15-alpine

# WORKDIR /home
# COPY . .
# RUN npm install
# RUN npm run build

# CMD ["node", "server.js"]

# FROM nginx:alpine
# COPY --from=0 /home/dist/app /usr/share/nginx/html


FROM node:10.15-stretch-slim
# FROM johnpapa/angular-cli as client-app
# LABEL authors="John Papa"
WORKDIR /usr/src/app
COPY ["package.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent
COPY . .
ENV PORT 4200
EXPOSE 4200
# RUN ng build --prod
CMD ["npm", "start"]

# # Node server
# FROM node:8.11-alpine as node-server
# WORKDIR /usr/src/app
# COPY ["package.json", "npm-shrinkwrap.json*", "./"]
# RUN npm install --production --silent && mv node_modules ../
# COPY server.js .
# COPY /server /usr/src/app/server

# # Final image
# FROM node:8.11-alpine
# WORKDIR /usr/src/app
# COPY --from=node-server /usr/src /usr/src
# COPY --from=client-app /usr/src/app/dist ./
# EXPOSE 3000
# # CMD ["node", "server.js"]
# CMD ["npm", "start"]
