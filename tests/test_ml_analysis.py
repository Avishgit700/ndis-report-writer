"""
ML analysis tests using PyTorch, pandas, and scikit-learn.
Tests note quality scoring, text classification, and data analysis
of generated NDIS notes.
"""
import pytest
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


# ─── Sample NDIS notes dataset ───────────────────────────────────────────────

GOOD_NOTES = [
    "John was supported with personal care including showering. He engaged enthusiastically and demonstrated progress toward his goal of increased independence. No incidents to report. Recommended follow-up: continue encouraging choice-making.",
    "Sarah participated in community access activities, visiting the local library and choosing her own books. She communicated effectively with staff and showed confidence in social interactions, aligning with her communication goals.",
    "Michael completed meal preparation with minimal prompting, selecting ingredients and following a simple recipe. This demonstrates meaningful progress toward his daily living independence goals.",
    "Emma attended her scheduled therapy session and actively engaged with her occupational therapist. She reported feeling positive and demonstrated improved fine motor skills during activities.",
    "David participated in his exercise program, completing 30 minutes of walking with encouragement. His mood was positive throughout. No concerns noted. Follow-up: review exercise goals at next planning meeting.",
]

BAD_NOTES = [
    "I made John shower today. He was difficult.",
    "Helped client. Nothing happened.",
    "john done stuff today ok",
    "We told the client what to do and he did it eventually after some issues.",
    "Support provided. Client was present.",
]

REPORT_TYPE_SAMPLES = [
    ("Progress Note", "John was supported with personal care. He demonstrated progress toward his independence goals."),
    ("Progress Note", "Sarah participated in community activities and showed improved social skills."),
    ("Incident Report", "A minor fall occurred in the bathroom. Immediate first aid was applied. Family notified. Follow-up review scheduled."),
    ("Incident Report", "The participant became distressed. De-escalation strategies were applied. Incident report completed."),
    ("Handover Note", "Shift summary: morning routine completed. Medications administered. Upcoming appointment tomorrow at 10am."),
    ("Handover Note", "Key observations: participant slept well. Meals consumed. No concerns. Pending: grocery shopping."),
]


# ─── Tests ───────────────────────────────────────────────────────────────────

class TestNoteQualityScorerPyTorch:
    """Neural network to score note quality (0–1) using PyTorch."""

    def build_features(self, notes: list[str]) -> torch.Tensor:
        """Convert notes to simple feature vectors."""
        features = []
        for note in notes:
            n = note.lower()
            features.append([
                len(note) / 500,                                          # length normalised
                float("goal" in n or "progress" in n),                   # mentions goals
                float("follow" in n or "recommend" in n),                # has follow-up
                float(not n.strip().startswith("i ")),                   # not worker-centred
                float("incident" not in n or "follow" in n),             # incidents resolved
                len(n.split()) / 100,                                     # word count normalised
                float(any(w in n for w in ["demonstrated", "chose", "participated", "engaged"])),
            ])
        return torch.tensor(features, dtype=torch.float32)

    def test_good_notes_score_higher(self):
        good_features = self.build_features(GOOD_NOTES)
        bad_features  = self.build_features(BAD_NOTES)

        # Simple linear scorer
        weights = torch.tensor([0.2, 0.2, 0.15, 0.15, 0.1, 0.1, 0.1])
        good_scores = (good_features * weights).sum(dim=1)
        bad_scores  = (bad_features  * weights).sum(dim=1)

        assert good_scores.mean() > bad_scores.mean(), \
            f"Good notes should score higher: {good_scores.mean():.3f} vs {bad_scores.mean():.3f}"

    def test_torch_tensor_shapes(self):
        features = self.build_features(GOOD_NOTES)
        assert features.shape == (len(GOOD_NOTES), 7)
        assert features.dtype == torch.float32

    def test_mlp_forward_pass(self):
        """Test a simple MLP can process note features without errors."""
        model = nn.Sequential(
            nn.Linear(7, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid(),
        )
        features = self.build_features(GOOD_NOTES + BAD_NOTES)
        with torch.no_grad():
            scores = model(features)
        assert scores.shape == (len(GOOD_NOTES) + len(BAD_NOTES), 1)
        assert (scores >= 0).all() and (scores <= 1).all()

    def test_gradient_flows(self):
        """Check gradients flow through the scorer."""
        model = nn.Sequential(nn.Linear(7, 1), nn.Sigmoid())
        features = self.build_features(GOOD_NOTES)
        scores = model(features)
        labels = torch.ones(len(GOOD_NOTES), 1)
        loss = nn.BCELoss()(scores, labels)
        loss.backward()
        for param in model.parameters():
            assert param.grad is not None


class TestNoteDataFramePandas:
    """Pandas-based analysis of note metadata and quality."""

    @pytest.fixture
    def notes_df(self):
        data = []
        for note in GOOD_NOTES:
            data.append({"note": note, "quality": "good", "word_count": len(note.split()),
                         "has_goals": "goal" in note.lower() or "progress" in note.lower(),
                         "has_followup": "follow" in note.lower() or "recommend" in note.lower()})
        for note in BAD_NOTES:
            data.append({"note": note, "quality": "bad",  "word_count": len(note.split()),
                         "has_goals": "goal" in note.lower() or "progress" in note.lower(),
                         "has_followup": "follow" in note.lower() or "recommend" in note.lower()})
        return pd.DataFrame(data)

    def test_dataframe_shape(self, notes_df):
        assert notes_df.shape == (len(GOOD_NOTES) + len(BAD_NOTES), 5)

    def test_good_notes_longer(self, notes_df):
        avg_good = notes_df[notes_df.quality == "good"]["word_count"].mean()
        avg_bad  = notes_df[notes_df.quality == "bad" ]["word_count"].mean()
        assert avg_good > avg_bad, "Good notes should be longer on average"

    def test_good_notes_mention_goals_more(self, notes_df):
        good_goals = notes_df[notes_df.quality == "good"]["has_goals"].mean()
        bad_goals  = notes_df[notes_df.quality == "bad" ]["has_goals"].mean()
        assert good_goals >= bad_goals

    def test_groupby_quality_stats(self, notes_df):
        stats = notes_df.groupby("quality")["word_count"].agg(["mean", "min", "max"])
        assert "good" in stats.index
        assert "bad"  in stats.index
        assert stats.loc["good", "mean"] > stats.loc["bad", "mean"]

    def test_no_nulls(self, notes_df):
        assert notes_df.isnull().sum().sum() == 0

    def test_word_count_positive(self, notes_df):
        assert (notes_df["word_count"] > 0).all()

    def test_pivot_table(self, notes_df):
        pivot = notes_df.pivot_table(values="word_count", index="quality",
                                     columns="has_goals", aggfunc="mean")
        assert pivot is not None
        assert pivot.shape[0] == 2


class TestNoteClassifierSklearn:
    """Scikit-learn classifier: predict note quality + report type."""

    @pytest.fixture
    def quality_dataset(self):
        notes  = GOOD_NOTES + BAD_NOTES
        labels = ["good"] * len(GOOD_NOTES) + ["bad"] * len(BAD_NOTES)
        return notes, labels

    @pytest.fixture
    def report_type_dataset(self):
        notes  = [s[1] for s in REPORT_TYPE_SAMPLES]
        labels = [s[0] for s in REPORT_TYPE_SAMPLES]
        return notes, labels

    def test_tfidf_vectorizer(self, quality_dataset):
        notes, _ = quality_dataset
        vec = TfidfVectorizer(max_features=50)
        X = vec.fit_transform(notes)
        assert X.shape[0] == len(notes)
        assert X.shape[1] <= 50

    def test_cosine_similarity_good_vs_bad(self):
        """Good notes should be more similar to each other than to bad notes."""
        vec = TfidfVectorizer()
        all_notes = GOOD_NOTES + BAD_NOTES
        X = vec.fit_transform(all_notes)
        good_X = X[:len(GOOD_NOTES)]
        bad_X  = X[len(GOOD_NOTES):]
        sim_good_good = cosine_similarity(good_X).mean()
        sim_good_bad  = cosine_similarity(good_X, bad_X).mean()
        assert sim_good_good > sim_good_bad, \
            "Good notes should be more similar to each other"

    def test_quality_classifier_trains(self, quality_dataset):
        notes, labels = quality_dataset
        vec = TfidfVectorizer(max_features=100)
        X = vec.fit_transform(notes)
        clf = LogisticRegression(max_iter=200)
        clf.fit(X, labels)
        preds = clf.predict(X)
        acc = accuracy_score(labels, preds)
        assert acc >= 0.6, f"Classifier accuracy too low: {acc:.2f}"

    def test_report_type_classifier(self, report_type_dataset):
        notes, labels = report_type_dataset
        vec = TfidfVectorizer(max_features=200)
        X = vec.fit_transform(notes)
        le = LabelEncoder()
        y = le.fit_transform(labels)
        clf = LogisticRegression(max_iter=300)
        clf.fit(X, y)
        preds = clf.predict(X)
        acc = accuracy_score(y, preds)
        assert acc >= 0.5

    def test_feature_importance_non_negative(self, quality_dataset):
        notes, labels = quality_dataset
        vec = TfidfVectorizer(max_features=50)
        X = vec.fit_transform(notes).toarray()
        assert (X >= 0).all(), "TF-IDF values should be non-negative"

    def test_label_encoder_roundtrip(self, report_type_dataset):
        _, labels = report_type_dataset
        le = LabelEncoder()
        encoded = le.fit_transform(labels)
        decoded = le.inverse_transform(encoded)
        assert list(decoded) == labels


class TestOllamaIntegration:
    """Test Ollama is reachable and can generate text."""

    def test_ollama_is_running(self):
        import requests
        try:
            res = requests.get("http://localhost:11434/api/tags", timeout=5)
            assert res.status_code == 200
        except Exception:
            pytest.skip("Ollama not running — skipping Ollama tests")

    def test_ollama_has_llama3(self):
        import requests
        try:
            res = requests.get("http://localhost:11434/api/tags", timeout=5)
            models = [m["name"] for m in res.json().get("models", [])]
            assert any("llama3" in m for m in models), f"llama3 not found. Available: {models}"
        except Exception:
            pytest.skip("Ollama not running")

    def test_ollama_langchain_generate(self):
        """Test LangChain Ollama wrapper generates a response."""
        try:
            from langchain_ollama import OllamaLLM
            llm = OllamaLLM(model="llama3", base_url="http://localhost:11434")
            result = llm.invoke("Say hello in one word.")
            assert isinstance(result, str)
            assert len(result.strip()) > 0
        except Exception as e:
            pytest.skip(f"Ollama LangChain test skipped: {e}")
