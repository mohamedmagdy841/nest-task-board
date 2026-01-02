# ======================
# Builder stage
# ======================
FROM node:24-alpine AS builder

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy Prisma + source
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 🔑 Generate Prisma Client BEFORE build
RUN npx prisma generate

# Build NestJS (now TS can see generated client)
RUN npm run build


# ======================
# Runner stage
# ======================
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app + generated prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 8000
CMD ["node", "dist/src/main.js"]
