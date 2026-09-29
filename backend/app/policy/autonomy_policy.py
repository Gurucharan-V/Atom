"""
Autonomy Policy Module
Determines if an action is non-consequential and safe to auto-apply,
or requires human-in-the-loop approval.
"""
from typing import Tuple
from ..models.models import ActionType

AUTO_APPROVAL_THRESHOLD_INR = 25000.0
HIGH_CONSEQUENCE_ACTIONS = {"payment_hold", "credit_note", "journal_entry"}

def evaluate_autonomy_policy(
    action_type: str,
    amount: float,
    confidence: float,
    vendor_risk: str = "standard"
) -> Tuple[bool, str]:
    """
    Returns (requires_human_approval, justification)
    """
    # 1. Confidence check
    if confidence < 0.75:
        return True, f"Confidence score ({confidence:.2f}) is below 0.75 autonomy safety threshold."

    # 2. Consequential action check
    if action_type in HIGH_CONSEQUENCE_ACTIONS:
        return True, f"Action '{action_type}' impacts ledger or cash-flow and requires explicit human sign-off."

    # 3. Monetary threshold check
    if amount > AUTO_APPROVAL_THRESHOLD_INR:
        return True, f"Amount ₹{amount:,.2f} exceeds auto-approval safety threshold of ₹{AUTO_APPROVAL_THRESHOLD_INR:,.2f}."

    # 4. Safe low-risk action (e.g. reminder email)
    return False, "Action is non-consequential and within automated policy bounds."
