#!/usr/bin/env bash
# Optional GitHub Packages auth for Cloud Agent / Docker builds.
# This starter uses public npm deps — missing MY_TOKEN is OK (exit 0).

set -euo pipefail

resolve_token() {
  if [[ -n "${MY_TOKEN:-}" ]]; then
    printf '%s' "$MY_TOKEN"
    return 0
  fi
  if [[ -f /run/secrets/MY_TOKEN ]]; then
    tr -d '\r\n' < /run/secrets/MY_TOKEN
    return 0
  fi
  return 1
}

if TOKEN="$(resolve_token)"; then
  echo "Configuring GitHub Packages auth from MY_TOKEN..."
  npm config set "@barabd-tax-software:registry" "https://npm.pkg.github.com"
  npm config set "//npm.pkg.github.com/:_authToken" "$TOKEN"
else
  echo "MY_TOKEN not set — installing from public registry only."
fi

echo "Installing dependencies..."
npm ci

if [[ -n "${TOKEN:-}" ]]; then
  npm config delete "//npm.pkg.github.com/:_authToken" || true
  npm config delete "@barabd-tax-software:registry" || true
fi

echo "Dependency installation complete."
exit 0
