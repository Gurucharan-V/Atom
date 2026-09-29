from dataclasses import dataclass
from typing import Any, Optional

@dataclass
class ToolResult:
    ok: bool
    data: Any
    error: Optional[str] = None
    duration_ms: int = 0
