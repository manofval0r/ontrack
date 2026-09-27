"""Standard error shape + global safety net.

Every error response looks like {"error": "<message>", "code": "<UPPER_SNAKE>"}:
- DRF exceptions -> message + uppercased default_code (e.g. AUTH_INVALID).
- Non-DRF exceptions with a status (e.g. Django Http404) -> status-code map.
- Anything else -> logged server-side with traceback; client gets
  {"error": "internal server error", "code": "INTERNAL_ERROR"} (never a leak).

Use ApiError(message, code, status) for explicit validation/business errors.
"""
import logging

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)

_STATUS_CODE_MAP = {
    status.HTTP_400_BAD_REQUEST: "VALIDATION_ERROR",
    status.HTTP_401_UNAUTHORIZED: "AUTH_INVALID",
    status.HTTP_403_FORBIDDEN: "PERMISSION_DENIED",
    status.HTTP_404_NOT_FOUND: "NOT_FOUND",
    status.HTTP_405_METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
    status.HTTP_429_TOO_MANY_REQUESTS: "THROTTLED",
    status.HTTP_503_SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
}


class ApiError(APIException):
    """Explicit error with a spec-shaped code, e.g.
    raise ApiError("value must be >= 0", "VALIDATION_ERROR", 400)."""

    def __init__(self, message, code, status_code=status.HTTP_400_BAD_REQUEST):
        self.status_code = status_code
        self.default_code = code.lower()
        super().__init__(detail=message)


def standard_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        if isinstance(response.data, dict):
            detail = response.data.get("detail", "request failed")
        else:
            detail = "request failed"
        raw_code = getattr(exc, "default_code", None)
        if isinstance(raw_code, str):
            code = raw_code.upper()
        else:
            code = _STATUS_CODE_MAP.get(response.status_code, "REQUEST_ERROR")
        response.data = {"error": str(detail), "code": code}
        return response
    logger.exception("Unhandled exception while processing request")
    return Response(
        {"error": "internal server error", "code": "INTERNAL_ERROR"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
