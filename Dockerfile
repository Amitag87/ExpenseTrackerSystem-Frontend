# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/spendsmart-frontend/browser /usr/share/nginx/html
# Copy custom nginx config if needed, or use default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
