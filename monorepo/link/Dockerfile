# Stage 1: Build the Astro application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage Docker caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build args for Astro static site generation
ARG PUBLIC_BRAND_NAME
ARG PUBLIC_APP_URL
ENV PUBLIC_BRAND_NAME=$PUBLIC_BRAND_NAME
ENV PUBLIC_APP_URL=$PUBLIC_APP_URL

# Build the static site
RUN npm run build

# Stage 2: Serve the static site using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx default html path
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
