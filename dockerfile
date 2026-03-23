FROM node:20-alpine

WORKDIR /app

# Install only dependency manifests first for better layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

ENV NODE_ENV=production
EXPOSE 6000

CMD ["npm", "start"]
