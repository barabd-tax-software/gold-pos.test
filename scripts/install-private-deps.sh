#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${MY_TOKEN:-}" ]]; then
  echo "error: MY_TOKEN is required (configure it as a Build Secret named MY_TOKEN)" >&2
  exit 1
fi

echo "Configuring private registry access..."

# Configure auth temporarily; removed after install so the token is not baked into the image
npm config set "@barabd-tax-software:registry" "https://npm.pkg.github.com"
npm config set "//npm.pkg.github.com/:_authToken" "${MY_TOKEN}"

echo "Installing dependencies..."
npm ci

npm config delete "//npm.pkg.github.com/:_authToken" || true
npm config delete "@barabd-tax-software:registry" || true

echo "Private dependency installation complete."
