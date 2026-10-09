FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js postcss.config.js tailwind.config.js ./
COPY src ./src
COPY public/Hindusthan-Park-1.png ./public/Hindusthan-Park-1.png
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY public ./public
COPY src/data/pandals.js ./src/data/pandals.js
COPY server.js users.json reports.json contacts.json pandal_requests.json ./
EXPOSE 3000
CMD ["node", "server.js"]
