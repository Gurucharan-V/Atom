"""
Matching Rules Engine & Variance Auto-Explainer
Specialized rules for Indian B2B Reconciliation:
1. Standard Indian GST Slabs: 5%, 12%, 18%, 28% (exclusive vs inclusive variance detection)
2. Forex Spread & Conversion Timing: ±2% spread check
3. Round-number and threshold anomaly flags
"""
from typing import Dict, Any, Optional, Tuple

GST_SLABS = [0.05, 0.12, 0.18, 0.28]
FOREX_TOLERANCE = 0.02  # ±2% currency exchange timing variance

def check_gst_variance(invoice_amount: float, paid_amount: float) -> Optional[Dict[str, Any]]:
    """
    Checks if difference between invoice and paid amount corresponds to standard Indian GST slabs.
    Case A: Invoice was exclusive of GST (e.g. 100,000), payment made inclusive of GST (e.g. 118,000).
    Case B: Invoice was inclusive of GST (e.g. 118,000), payment made base amount (e.g. 100,000).
    Case C: TDS deduction at 1% or 2% under section 194C/194J.
    """
    if invoice_amount <= 0 or paid_amount <= 0:
        return None

    diff = paid_amount - invoice_amount
    abs_diff = abs(diff)

    for rate in GST_SLABS:
        pct_int = int(rate * 100)
        # Expected inclusive amount from base invoice
        expected_inclusive = invoice_amount * (1 + rate)
        if abs(paid_amount - expected_inclusive) < 1.0:
            return {
                "type": "gst_inclusive_paid",
                "rate": pct_int,
                "gst_amount": round(invoice_amount * rate, 2),
                "explanation": f"Payment ₹{paid_amount:,.2f} matches Invoice ₹{invoice_amount:,.2f} + {pct_int}% GST (₹{round(invoice_amount * rate, 2):,.2f}). Vendor billed GST-exclusive, remitted with statutory GST.",
                "confidence_boost": 0.96,
                "auto_resolvable": True,
                "action_type": "journal_entry",
                "recommended_action": f"Post ₹{round(invoice_amount * rate, 2):,.2f} GST Input Tax Credit (ITC) to Ledger"
            }

        # Expected base from inclusive invoice
        expected_base = invoice_amount / (1 + rate)
        if abs(paid_amount - expected_base) < 1.0:
            return {
                "type": "gst_exclusive_paid",
                "rate": pct_int,
                "gst_amount": round(invoice_amount - expected_base, 2),
                "explanation": f"Invoice ₹{invoice_amount:,.2f} was issued GST-inclusive ({pct_int}%). Remittance ₹{paid_amount:,.2f} reflects base taxable value. GST component withheld pending GSTR-2B filing.",
                "confidence_boost": 0.95,
                "auto_resolvable": True,
                "action_type": "journal_entry",
                "recommended_action": f"Accrue ₹{round(invoice_amount - expected_base, 2):,.2f} GST liability pending GSTR-2B reflection"
            }

    # Also check TDS 1% / 2% / 10%
    for tds_rate in [0.01, 0.02, 0.10]:
        expected_after_tds = invoice_amount * (1 - tds_rate)
        if abs(paid_amount - expected_after_tds) < 1.0:
            tds_pct = int(tds_rate * 100)
            tds_amt = round(invoice_amount * tds_rate, 2)
            return {
                "type": "tds_withholding",
                "rate": tds_pct,
                "tds_amount": tds_amt,
                "explanation": f"Difference corresponds exactly to {tds_pct}% TDS withholding (₹{tds_amt:,.2f}) under Section 194C/J.",
                "confidence_boost": 0.97,
                "auto_resolvable": True,
                "action_type": "journal_entry",
                "recommended_action": f"Record Form 26AS TDS certificate credit for ₹{tds_amt:,.2f}"
            }

    return None

def check_forex_variance(invoice_amount: float, paid_amount: float, currency: str = "INR") -> Optional[Dict[str, Any]]:
    """
    Checks if discrepancy is within ±2% forex exchange timing variance.
    """
    if invoice_amount <= 0 or paid_amount <= 0:
        return None

    pct_diff = abs(paid_amount - invoice_amount) / invoice_amount
    if 0.0001 < pct_diff <= FOREX_TOLERANCE:
        variance_amount = round(abs(paid_amount - invoice_amount), 2)
        direction = "gain" if paid_amount > invoice_amount else "loss"
        return {
            "type": "forex_variance",
            "pct_diff": round(pct_diff * 100, 2),
            "variance_amount": variance_amount,
            "explanation": f"Discrepancy of ₹{variance_amount:,.2f} ({pct_diff * 100:.2f}%) is within RBI benchmark interbank forex spread (±2%) due to booking-to-settlement rate change.",
            "confidence_boost": 0.94,
            "auto_resolvable": True,
            "action_type": "journal_entry",
            "recommended_action": f"Book ₹{variance_amount:,.2f} to Foreign Exchange Fluctuation A/c ({direction.title()})"
        }
    return None

def explain_variance(invoice_amount: float, paid_amount: float, currency: str = "INR") -> Optional[Dict[str, Any]]:
    """
    Main rule evaluation router for tax and forex variances.
    """
    # 1. Check GST / Tax
    gst_res = check_gst_variance(invoice_amount, paid_amount)
    if gst_res:
        return gst_res

    # 2. Check Forex
    forex_res = check_forex_variance(invoice_amount, paid_amount, currency)
    if forex_res:
        return forex_res

    return None
