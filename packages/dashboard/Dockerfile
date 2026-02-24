FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_RULES_SERVER_URL=http://localhost:3847
ENV NEXT_PUBLIC_RULES_SERVER_URL=$NEXT_PUBLIC_RULES_SERVER_URL

RUN npm run build


FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3848
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3848

CMD ["node", "server.js"]
