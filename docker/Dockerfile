FROM node:20-slim

LABEL maintainer="FTH Trading"
LABEL description="LPS-1 Reference Implementation — reproducible build environment"

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --ignore-scripts 2>/dev/null || npm install

# Copy source
COPY . .

# Compile contracts
RUN npx hardhat compile

# Default: run the full demo
CMD ["npm", "run", "demo"]
