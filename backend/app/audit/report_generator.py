"""
Report Generator Module
Generates structured HTML / JSON audit reports for reconciliation cases.
"""
from typing import Dict, Any

def generate_case_report(case_data: Dict[str, Any]) -> str:
    case_id = case_data.get("id", "N/A")
    vendor = case_data.get("vendor", "N/A")
    status = case_data.get("status", "N/A")
    gap = case_data.get("gap", 0)

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Eclipse Reconciliation Audit Report - {case_id}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #16202C; }}
    h1 {{ border-bottom: 2px solid #D9DEE5; padding-bottom: 12px; }}
    .badge {{ display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; background: #F2F4F7; }}
    .trace-item {{ padding: 8px; margin: 6px 0; border-left: 3px solid #1F8A70; background: #FAFAFA; }}
  </style>
</head>
<body>
  <h1>Reconciliation Audit Report: {case_id}</h1>
  <p><strong>Vendor:</strong> {vendor}</p>
  <p><strong>Status:</strong> <span class="badge">{status}</span></p>
  <p><strong>Unreconciled Variance:</strong> ₹{gap:,.2f}</p>
  <hr/>
  <h2>Immutable Trace Timeline</h2>
  <div>
"""
    for tr in case_data.get("trace", []):
        html += f"""
    <div class="trace-item">
      <strong>[{tr.get('step', '').upper()}]</strong> {tr.get('summary', '')} <small>({tr.get('ts', '')})</small>
    </div>
"""
    html += """
  </div>
</body>
</html>
"""
    return html
