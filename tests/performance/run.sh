#!/bin/bash
# Run k6 performance tests for Student Management System
# Usage: ./run.sh [smoke|baseline|load|stress|spike|breakpoint|soak|all]
# Set BASE_URL and optionally AUTH_TOKEN before running

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Default to smoke if no arg
TEST="${1:-smoke}"

# Required
if [ -z "$BASE_URL" ] && [ -z "$SMS_BASE_URL" ]; then
  echo "Error: BASE_URL or SMS_BASE_URL must be set"
  echo "Example: BASE_URL=http://localhost:4000 ./run.sh smoke"
  exit 1
fi

export BASE_URL="${BASE_URL:-$SMS_BASE_URL}"

# Optional AUTH_TOKEN for authenticated endpoints
# Get token via: curl -s -X POST $BASE_URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"...","password":"..."}' | jq -r '.token'

run_test() {
  local name="$1"
  local file="$2"
  echo "=========================================="
  echo "Running $name..."
  echo "BASE_URL=$BASE_URL"
  echo "=========================================="
  k6 run "$file"
}

case "$TEST" in
  smoke)     run_test "Smoke"     smoke/smoke.js ;;
  baseline)  run_test "Baseline"  baseline/baseline.js ;;
  load)      run_test "Load"      load/load.js ;;
  stress)    run_test "Stress"    stress/stress.js ;;
  spike)     run_test "Spike"     spike/spike.js ;;
  breakpoint) run_test "Breakpoint" breakpoint/breakpoint.js ;;
  soak)      run_test "Soak"      soak/soak.js ;;
  all)       run_test "Smoke" smoke/smoke.js && run_test "Baseline" baseline/baseline.js && run_test "Load" load/load.js ;;
  *)
    echo "Unknown test: $TEST"
    echo "Usage: $0 [smoke|baseline|load|stress|spike|breakpoint|soak|all]"
    exit 1
    ;;
esac
