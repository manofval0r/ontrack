"""Per-user burst throttles (10/min). Keyed on the verified Supabase user_id,
not the client IP, so one abusive IP can't burn another user's budget and
users behind one NAT don't share a bucket.

Rates live in settings REST_FRAMEWORK.DEFAULT_THROTTLE_RATES.
"""
from rest_framework.throttling import SimpleRateThrottle


class _UserIdThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        user_id = getattr(request, "user_id", None)
        if user_id is None:
            return None  # No identity -> permission layer rejects anyway.
        return self.cache_format % {"scope": self.scope, "ident": str(user_id)}


class GoalsBurstThrottle(_UserIdThrottle):
    scope = "goals_burst"


class AsrBurstThrottle(_UserIdThrottle):
    scope = "asr_burst"
