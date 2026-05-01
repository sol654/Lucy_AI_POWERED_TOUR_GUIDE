import json
import logging
import os

import faiss
import numpy as np

logger = logging.getLogger(__name__)

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../../data/dataset.json")
INDEX_DIR = os.path.join(os.path.dirname(__file__), "../../data/faiss_index")
INDEX_FILE = os.path.join(INDEX_DIR, "lucy_faiss.index")
EMB_FILE = os.path.join(INDEX_DIR, "lucy_texts.json")
MODEL_NAME = "all-MiniLM-L6-v2"

# Load dataset
if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

with open(DATASET_PATH, encoding="utf-8") as f:
    _data = json.load(f)

texts = [
    f"{item.get('name','')}. {item.get('description','')} {item.get('history','')} "
    f"{item.get('architecture','')} {item.get('cultural_significance','')}"
    for item in _data
]

# Try to load sentence transformer model
_model = None
_index = None

try:
    from sentence_transformers import SentenceTransformer
    _model = SentenceTransformer(MODEL_NAME)
    logger.info("Sentence transformer model loaded.")

    os.makedirs(INDEX_DIR, exist_ok=True)

    if os.path.exists(INDEX_FILE) and os.path.exists(EMB_FILE):
        try:
            _index = faiss.read_index(INDEX_FILE)
            with open(EMB_FILE, "r", encoding="utf-8") as f:
                persisted = json.load(f)
            if len(persisted) != len(texts):
                raise ValueError("Index mismatch — rebuilding.")
        except Exception:
            _index = None

    if _index is None:
        embeddings = _model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        _index = faiss.IndexFlatL2(embeddings.shape[1])
        _index.add(np.array(embeddings).astype("float32"))
        faiss.write_index(_index, INDEX_FILE)
        with open(EMB_FILE, "w", encoding="utf-8") as f:
            json.dump(texts, f, ensure_ascii=False)
        logger.info("FAISS index built and saved.")

except Exception as e:
    logger.warning("Semantic search unavailable (model load failed): %s", e)
    logger.warning("Falling back to keyword search.")
    _model = None
    _index = None


def retrieve(query: str, top_k: int = 3) -> list:
    """Return top_k relevant context strings for the query."""
    if not query or not query.strip():
        return texts[:top_k]

    # Semantic search if model available
    if _model is not None and _index is not None:
        try:
            q_emb = _model.encode([query], convert_to_numpy=True)
            D, I = _index.search(np.array(q_emb).astype("float32"), top_k)
            return [texts[i] for i in I[0] if i < len(texts)]
        except Exception as e:
            logger.warning("FAISS search failed, falling back to keyword: %s", e)

    # Keyword fallback — always works even without the model
    q = query.lower()
    scored = [(t, sum(w in t.lower() for w in q.split())) for t in texts]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [t for t, _ in scored[:top_k]]
