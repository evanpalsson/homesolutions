FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# OLD BUILD (before Air)
# FROM node:16-alpine

# WORKDIR /app

# COPY package.json package-lock.json /frontend/
# COPY ./public /frontend/public
# COPY ./src /frontend/src
# # RUN npm install -g serve

# COPY . .

# EXPOSE 3000

# CMD ["npm", "start"]