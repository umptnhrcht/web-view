from sentence_transformers import SentenceTransformer
from threading import Lock


class Embedder:
    _instance = None
    _lock = Lock()

    def __new__(cls, *args, **kwargs):
        raise RuntimeError("Use Embedder.get_instance() instead of constructor.")

    @staticmethod
    def get_instance():
        if not Embedder._instance:
            with Embedder._lock:
                if not Embedder._instance:
                    inst = object.__new__(Embedder)
                    inst.model = SentenceTransformer("all-MiniLM-L6-v2")
                    Embedder._instance = inst
        return Embedder._instance

    @staticmethod
    def get_embedding(text: str):
        instance = Embedder.get_instance()
        return instance.model.encode(text)
