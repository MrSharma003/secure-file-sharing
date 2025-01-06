FROM node:16 AS development

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /react-app

# Installing dependencies
COPY ./package*.json /react-app

RUN npm install

# Copying all the files in our project
COPY . .

# Exposing port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
