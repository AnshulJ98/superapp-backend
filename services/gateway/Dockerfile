FROM node:18-alpine
WORKDIR /app
COPY index.js ./
 # No dependency install required; gateway uses only built-in Node APIs
EXPOSE 8080
CMD ["node", "index.js"]
