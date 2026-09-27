#!/bin/sh
# One image, two Render instances (web + mobile differ only by env vars).
# Migrations run ONLY when RUN_MIGRATIONS=true so the two instances never race.
set -e

# Preflight: fail fast with a readable error if DATABASE_URL is malformed.
# Prints user/host/port only — never the password. Supabase pooler (:6543)
# requires username 'postgres.PROJECT_REF'; plain 'postgres' always 401s.
_PY=python3
command -v python3 >/dev/null 2>&1 || _PY=python
"$_PY" - <<'EOF'
import os, sys
from urllib.parse import urlparse
url = os.environ.get("DATABASE_URL", "")
if not url:
    print("ERROR: DATABASE_URL is empty. Set it in Render -> Environment.")
    sys.exit(1)
u = urlparse(url)
print("DB target: user=%r host=%r port=%r db=%r" % (u.username, u.hostname, u.port, u.path.lstrip("/")))
if (u.hostname or "").endswith("pooler.supabase.com") or u.port == 6543:
    if not u.username or "." not in u.username:
        print("ERROR: Supabase pooler needs username 'postgres.PROJECT_REF', got %r." % (u.username,))
        print("Fix DATABASE_URL in Render -> Environment, e.g.:")
        print("  postgres://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres")
        sys.exit(1)
EOF

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "RUN_MIGRATIONS=true: applying migrations..."
  python manage.py migrate --noinput
else
  echo "RUN_MIGRATIONS!=true: skipping migrations."
fi

echo "Starting: $@"
exec "$@"
