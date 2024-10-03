# Step 1: Specify the base image
FROM node:18-alpine AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files
COPY package*.json ./

# Step 4: Install the project dependencies
RUN npm install

# Step 5: Copy the entire project directory into the container
COPY . .

# Step 6: Build the React application
RUN npm run build

# Step 7: Specify the base image for serving the built React app
FROM nginx:stable-alpine

# Step 8: Copy the built files from the previous stage to Nginx’s web server directory
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose port 80 to make the app accessible
EXPOSE 80

# Step 10: Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
