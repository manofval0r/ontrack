#!/bin/sh
# Run every smoke test with real output. Assumes deps are installed.
# Usage: ./scripts/run_smoke.sh
set -e
cd "$(dirname "$0")/.."
echo "=== auth smoke test ==="
python3 scripts/smoke_auth.py
echo "=== endpoint + hardening tests ==="
python3 manage.py test
