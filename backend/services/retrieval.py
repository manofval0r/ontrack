# IMPLEMENTATION APPROACH: OPTION A (Real vector similarity search using pgvector)
import sys
from pathlib import Path

_ontrack_dir = Path(__file__).resolve().parent.parent / "ontrack"
if str(_ontrack_dir) not in sys.path:
    sys.path.insert(0, str(_ontrack_dir))

from services.retrieval import get_relevant_context, _normalize_user_id, _cosine_similarity
