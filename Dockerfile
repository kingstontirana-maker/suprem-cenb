# CENB for Coolify ("Build Pack: Dockerfile"). No npm dependencies and no data of its own.
FROM node:22.20.0-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
