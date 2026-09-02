# Stage 1: Install dependencies and build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files first to leverage Docker layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application (excluding items in .dockerignore)
COPY . .

# Provide a dummy variable to satisfy Next.js static generation during build
ENV DATABASE_URL="postgres://dummy_user:dummy_password@localhost/dummy_db"

# Build the Next.js app
RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner
WORKDIR /app

# Enforce production mode
ENV NODE_ENV production

# Copy necessary build artifacts from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the standard Next.js port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
