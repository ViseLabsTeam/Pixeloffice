FROM node:22.14.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci
COPY apps/api ./apps/api
COPY packages ./packages
RUN npm run build --workspace @pixel-office/api
RUN npm prune --omit=dev

FROM node:22.14.0-alpine
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
