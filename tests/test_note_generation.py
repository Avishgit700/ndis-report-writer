"""
Note generation API tests — covers all 6 report types, edge cases, auth.
Uses Ollama (local LLM) via the running Next.js server.
"""
import requests
import pytest

BASE_URL = "http://localhost:3000"

REPORT_TYPES = [
    "Progress Note",
    "Incident Report",
    "Handover Note",
    "Support Plan",
    "Goal Review Note",
    "Functional Capacity Assessment",
]


def test_generate_progress_note(headers):
    res = requests.post(f"{BASE_URL}/api/generate-note", json={
        "reportType": "Progress Note",
        "clientName": "John Smith",
        "workerName": "Sarah Jones",
        "date": "2026-06-17",
        "duration": "2 hours",
        "clientGoals": "Increase independence in daily living activities",
        "mood": "Happy and engaged",
        "rawNotes": "john shower good mood talked about birthday chose own clothes no incidents",
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "note" in data
    assert len(data["note"]) > 100, "Note is too short"
    # Person-centred language check
    note = data["note"].lower()
    assert "john" in note


@pytest.mark.parametrize("report_type", REPORT_TYPES)
def test_all_report_types(headers, report_type):
    res = requests.post(f"{BASE_URL}/api/generate-note", json={
        "reportType": report_type,
        "clientName": "Jane Doe",
        "workerName": "Test Worker",
        "rawNotes": "participant completed activities well, positive mood, no concerns",
    }, headers=headers)
    assert res.status_code == 200
    assert "note" in res.json()
    assert len(res.json()["note"]) > 80


def test_generate_note_unauthenticated():
    res = requests.post(f"{BASE_URL}/api/generate-note", json={
        "rawNotes": "test notes",
    })
    assert res.status_code == 401


def test_generate_note_empty_notes(headers):
    res = requests.post(f"{BASE_URL}/api/generate-note", json={
        "reportType": "Progress Note",
        "rawNotes": "",
    }, headers=headers)
    assert res.status_code == 400


def test_generate_note_missing_notes(headers):
    res = requests.post(f"{BASE_URL}/api/generate-note", json={
        "reportType": "Progress Note",
    }, headers=headers)
    assert res.status_code == 400


def test_note_contains_no_first_person_worker(headers):
    """Notes should be about the participant, not 'I' statements from the worker."""
    res = requests.post(f"{BASE_URL}/api/generate-note", json={
        "reportType": "Progress Note",
        "clientName": "Alex Brown",
        "rawNotes": "I helped alex with cooking. I supported him to choose ingredients.",
    }, headers=headers)
    assert res.status_code == 200
    note = res.json()["note"]
    # Should not start with "I" — should be person-centred
    assert not note.strip().startswith("I supported"), \
        "Note should be person-centred, not worker-centred"


def test_incident_report_has_followup(headers):
    res = requests.post(f"{BASE_URL}/api/generate-note", json={
        "reportType": "Incident Report",
        "clientName": "Sam Wilson",
        "rawNotes": "sam fell in bathroom, no injury, supported back to chair, family notified",
        "incidents": "Minor fall in bathroom",
    }, headers=headers)
    assert res.status_code == 200
    note = res.json()["note"].lower()
    # Incident reports should mention follow-up
    assert any(word in note for word in ["follow", "monitor", "review", "notify", "report"])
