"""Harden Supabase: enable RLS (deny-by-default) on all app tables.

Context: Django connects as the `postgres` superuser (bypasses RLS), so the
app is unaffected. But Supabase exposes `public` via PostgREST, and the
linter flags every table without RLS — including `accounts_integration`
(access_token) and `auth_user` (password) as sensitive.

Fix: ENABLE ROW LEVEL SECURITY with NO permissive policies. PostgREST
anon/authenticated roles then get zero rows; Django keeps full access.
Postgres-only: skipped on SQLite (local dev / test DB) via vendor guard.
Reverse: disables RLS again.
"""
from django.db import migrations

TABLES = [
    "django_migrations",
    "django_content_type",
    "auth_permission",
    "auth_group",
    "auth_group_permissions",
    "auth_user_groups",
    "auth_user_user_permissions",
    "auth_user",
    "goals_audiocache",
    "goals_goal",
    "goals_checkin",
    "goals_goalitem",
    "accounts_integration",
    "goals_progresslog",
]


def enable_rls(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        for table in TABLES:
            cursor.execute('ALTER TABLE "%s" ENABLE ROW LEVEL SECURITY' % table)


def disable_rls(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        for table in TABLES:
            cursor.execute('ALTER TABLE "%s" DISABLE ROW LEVEL SECURITY' % table)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("goals", "0003_goal_goal_template"),
    ]

    operations = [
        migrations.RunPython(enable_rls, reverse_code=disable_rls, elidable=True),
    ]
