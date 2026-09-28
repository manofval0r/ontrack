import sys
from pathlib import Path

_ontrack_dir = Path(__file__).resolve().parent.parent / "ontrack"
if str(_ontrack_dir) not in sys.path:
    sys.path.insert(0, str(_ontrack_dir))

from services.embeddings import generate_embedding, EMBEDDING_DIM
