FROM node:lts-alpine

# Copy the application
WORKDIR /usr/src/app

# Install all the dependencies
COPY pnpm-lock.yaml package.json .
RUN npm install --global pnpm && pnpm install --frozen-lockfile

# Run the program
COPY . .
CMD ["node", "src/index.js"]
