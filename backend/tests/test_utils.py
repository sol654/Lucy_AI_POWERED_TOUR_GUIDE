import pytest
from app.utils import clean_text, split_into_sentences, truncate_text, format_location_name

def test_clean_text():
    assert clean_text("  hello   world  ") == "hello world"
    assert clean_text("") == ""
    assert clean_text("no extra spaces") == "no extra spaces"

def test_split_into_sentences():
    text = "Hello world. How are you? I'm fine."
    sentences = split_into_sentences(text)
    assert len(sentences) == 3
    assert sentences[0] == "Hello world."

def test_truncate_text():
    long_text = "This is a very long text that should be truncated to fit within the limit."
    truncated = truncate_text(long_text, 20)
    assert len(truncated) <= 23  # + "..."
    assert truncated.endswith("...")

def test_format_location_name():
    assert format_location_name("axum") == "Axum"
    assert format_location_name("") == ""