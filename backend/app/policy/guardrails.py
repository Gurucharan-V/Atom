"""
Security Guardrails Module
Masks sensitive bank account numbers and PII in prompts and logs.
"""
import re

def mask_bank_account(text: str) -> str:
    """Masks 9-18 digit account numbers, leaving last 4 digits visible"""
    return re.sub(r'\b(\d{5,14})(\d{4})\b', r'XXXX-XXXX-\2', text)

def sanitize_payload(payload: dict) -> dict:
    sanitized = {}
    for k, v in payload.items():
        if isinstance(v, str):
            sanitized[k] = mask_bank_account(v)
        elif isinstance(v, dict):
            sanitized[k] = sanitize_payload(v)
        else:
            sanitized[k] = v
    return sanitized
