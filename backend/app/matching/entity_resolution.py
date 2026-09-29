"""
Entity Resolution Module
Performs fuzzy vendor name matching and suffix normalization.
"""
import re
try:
    from rapidfuzz import fuzz
except ImportError:
    # Fallback ratio if rapidfuzz not present
    class FuzzFallback:
        @staticmethod
        def token_set_ratio(s1: str, s2: str) -> float:
            s1_words = set(s1.lower().split())
            s2_words = set(s2.lower().split())
            overlap = len(s1_words & s2_words)
            total = max(len(s1_words | s2_words), 1)
            return (overlap / total) * 100.0
    fuzz = FuzzFallback()

SUFFIX_PATTERNS = [
    r'\bpvt\.?\s*ltd\.?\b',
    r'\bprivate\s+limited\b',
    r'\bltd\.?\b',
    r'\bllc\b',
    r'\binc\.?\b',
    r'\bcorp\.?\b',
    r'\bindia\b',
]

def normalize_vendor_name(name: str) -> str:
    cleaned = name.lower().strip()
    for pattern in SUFFIX_PATTERNS:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned)
    return ' '.join(cleaned.split())

def match_vendor(name1: str, name2: str) -> float:
    """Returns match confidence between 0.0 and 1.0"""
    norm1 = normalize_vendor_name(name1)
    norm2 = normalize_vendor_name(name2)
    score = fuzz.token_set_ratio(norm1, norm2)
    return score / 100.0
