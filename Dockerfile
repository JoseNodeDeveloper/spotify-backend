# Two-stage image: the final stage contains only the compiled code and production dependencies.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# Never run as root inside the container.
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
