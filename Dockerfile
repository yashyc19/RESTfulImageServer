# install nodejs
FROM node:14

# Create app directory
WORKDIR /app

# Install app dependencies
COPY . .

# Bundle app source
COPY package*.json ./

# Install app dependencies
RUN npm install

# Export port
EXPOSE 5000

# Run the app
CMD ["npm", "run", "start"]