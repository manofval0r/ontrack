"""Permission layer: every protected view requires a verified Supabase user.

Missing credentials reach here (the authenticator returns None), so this
permission raises AuthInvalid -> 401 {"error","code":"AUTH_INVALID"} instead
of DRF's default 403. Health/debug views opt out with their own permissions.
"""
from rest_framework.permissions import BasePermission

from apps.accounts.authentication import AuthInvalid


class HasSupabaseUser(BasePermission):
    message = "authentication credentials were not provided"

    def has_permission(self, request, view):
        user_id = getattr(request, "user_id", None)
        if user_id is None:
            user = getattr(request, "user", None)
            user_id = getattr(user, "user_id", None)
        if user_id is None:
            raise AuthInvalid(self.message)
        request.user_id = user_id
        return True
