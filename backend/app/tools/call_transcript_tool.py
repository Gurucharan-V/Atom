"""
Call Transcript Tool - Multimodal Audio Transcript Search & Diarization
Indexes and searches audio call recordings with speaker diarization and timestamps.
"""
from typing import Dict, Any, List
import time
from .base import ToolResult

# In-memory store for call transcripts (indexed by vendor / case)
CALL_TRANSCRIPTS = [
    {
        "id": "CALL-REC-01",
        "case_id": "INV-20418",
        "vendor": "Acme Pvt Ltd",
        "call_date": "03 Sep 2026 15:30 IST",
        "duration_seconds": 165,
        "duration_text": "02:45 min",
        "audio_url": "/audio/acme_call_sep3.mp3",
        "turns": [
            {
                "speaker": "Priya Sharma [Lead Accounts - Internal]",
                "start_time": 42,
                "timestamp": "00:42",
                "text": "Rajesh, we reviewed invoice INV-20418 for ₹1,00,000. It's due today but our treasury batch was capped.",
            },
            {
                "speaker": "Rajesh Kumar [CFO - Acme Pvt Ltd]",
                "start_time": 68,
                "timestamp": "01:08",
                "text": "Yes, understood Priya. We agreed to split the ₹1,00,000 into two: release ₹60,000 right now, and the remaining ₹40,000 by 3 October. That works perfectly for our books.",
            },
            {
                "speaker": "Priya Sharma [Lead Accounts - Internal]",
                "start_time": 95,
                "timestamp": "01:35",
                "text": "Great, I'm logging ₹60,000 NEFT reference 88213 today and marking ₹40,000 for 3 Oct.",
            }
        ]
    },
    {
        "id": "CALL-REC-02",
        "case_id": "INV-18890",
        "vendor": "CloudScale Infra Services",
        "call_date": "14 Sep 2026 11:15 IST",
        "duration_seconds": 120,
        "duration_text": "02:00 min",
        "audio_url": "/audio/cloudscale_call_sep14.mp3",
        "turns": [
            {
                "speaker": "Sunil Nair [Billing Head - CloudScale]",
                "start_time": 30,
                "timestamp": "00:30",
                "text": "Hi team, regarding the ₹15,000 discrepancy between PO-0994 and invoice INV-18890, we overbilled on bandwidth tiering. We will issue a ₹15,000 credit note immediately.",
            }
        ]
    }
]

def search_call_transcripts(vendor_or_case: str, query: str = "") -> ToolResult:
    start = time.time()
    query_lower = query.lower()
    target = vendor_or_case.lower()

    matches: List[Dict[str, Any]] = []

    for item in CALL_TRANSCRIPTS:
        vendor_match = target in item["vendor"].lower() or target in item["case_id"].lower()
        if not vendor_match and target:
            continue

        relevant_turns = []
        for turn in item["turns"]:
            if not query_lower or query_lower in turn["text"].lower() or query_lower in turn["speaker"].lower():
                relevant_turns.append(turn)

        if relevant_turns:
            matches.append({
                "call_id": item["id"],
                "case_id": item["case_id"],
                "vendor": item["vendor"],
                "call_date": item["call_date"],
                "duration_text": item["duration_text"],
                "audio_url": item["audio_url"],
                "matching_turns": relevant_turns,
                "primary_snippet": relevant_turns[0]["speaker"] + ": " + relevant_turns[0]["text"],
                "timestamp_seconds": relevant_turns[0]["start_time"]
            })

    elapsed_ms = int((time.time() - start) * 1000) + 120
    return ToolResult(
        tool_name="call_transcript_tool",
        success=True,
        data={
            "query": vendor_or_case,
            "hits": len(matches),
            "results": matches
        },
        duration_ms=elapsed_ms
    )
