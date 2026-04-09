FROM node:20-alpine AS deps

WORKDIR /app
COPY apps/api/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder

WORKDIR /app
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api/ .
COPY proto/ proto/
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/package.json ./

EXPOSE 3001
CMD ["node", "dist/main.js"]
