#!/usr/bin/env bash
# ------------------------------------------------------------------
# Render infrastructure/cloudrun/*.service.yaml with real project values.
#
# Usage:
#   ./scripts/render-gcp-manifests.sh <project-id> <region> <repo>
#
# Writes rendered manifests to /tmp/creditrisk-gcp/ and prints the gcloud
# commands to apply them.
# ------------------------------------------------------------------
set -euo pipefail

PROJECT_ID="${1:?Usage: render-gcp-manifests.sh <project-id> <region> <repo>}"
REGION="${2:-europe-west1}"
REPO="${3:-creditrisk}"
OUT_DIR="/tmp/creditrisk-gcp"
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)/infrastructure/cloudrun"

mkdir -p "$OUT_DIR"

SERVICES=(api-gateway customer-service application-service risk-service decision-service audit-service ml-service frontend)

for svc in "${SERVICES[@]}"; do
  sed -e "s|PROJECT_ID|${PROJECT_ID}|g" \
      -e "s|REGION|${REGION}|g" \
      -e "s|REPO|${REPO}|g" \
      -e "s|<DB_NAME>|creditrisk|g" \
      "$SRC_DIR/$svc.service.yaml" > "$OUT_DIR/$svc.service.yaml"
  echo "rendered: $OUT_DIR/$svc.service.yaml"
done

echo
echo "Apply with:"
echo "  for svc in ${SERVICES[*]}; do"
echo "    gcloud run services replace $OUT_DIR/\$svc.service.yaml --region $REGION"
echo "  done"
