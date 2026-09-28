import sys
from pathlib import Path

_ontrack_dir = Path(__file__).resolve().parent / "ontrack"
if str(_ontrack_dir) not in sys.path:
    sys.path.insert(0, str(_ontrack_dir))

from apps.goals.models import Goal, GoalItem, ProgressLog, CheckIn, AudioCache
