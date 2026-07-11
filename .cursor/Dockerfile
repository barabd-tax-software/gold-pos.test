# syntax=docker/dockerfile:1.4

FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy dependency manifests and install script for layer caching
COPY package.json package-lock.json ./
COPY scripts/install-private-deps.sh ./scripts/install-private-deps.sh
RUN chmod +x ./scripts/install-private-deps.sh

# MY_TOKEN Build Secret is optional (public npm deps; token only for future private packages)
RUN --mount=type=secret,id=MY_TOKEN,env=MY_TOKEN,required=false \
    ./scripts/install-private-deps.sh
