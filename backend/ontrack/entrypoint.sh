#!/bin/sh
# One image, two Render instances (web + mobile differ only by env vars).
# Migrations run ONLY when RUN_MIGRATIONS=true so the two instances never race.
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "RUN_MIGRATIONS=true: applying migrations..."
  python manage.py migrate --noinput
else
  echo "RUN_MIGRATIONS!=true: skipping migrations."
fi

echo "Starting: $@"
exec "$@"
