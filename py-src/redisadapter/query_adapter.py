from typing import List, Any

import numpy as np

from .connection import RedisConnector
from data import Embedder
from redis.commands.search.query import Query


class QueryAdapter:
    @staticmethod
    def multi_knn_search(
        index_name: str, query_text: str, vector_fields: list, k: int = 5
    ) -> dict:
        """
        Performs individual KNN search over all vector_fields using knn_search.
        Returns a dict mapping field name to its top-k results.
        """
        results = {}
        for field in vector_fields:
            results[field] = QueryAdapter.knn_search(index_name, query_text, field, k)
        return results

    @staticmethod
    def knn_search(
        index_name: str, query_text: str, vector_field: str, data_field: str, k: int = 5
    ) -> List[Any]:
        """
        Performs a KNN search on the given index using the provided query text.
        Returns top k results.
        """
        conn = RedisConnector.last_connection()
        if not conn:
            raise RuntimeError("No active Redis connection")
        client = conn.get_client()
        if not client:
            raise RuntimeError("No active Redis client")

        # Get embedding for query
        embedding = Embedder.get_embedding_as_bytes(query_text)
        params = {"vec": embedding}

        # Redisearch KNN query
        # Example: FT.SEARCH index_name '*=>[KNN k @vector_field $BLOB]' PARAMS 2 BLOB <embedding> DIALECT 2
        query = (
            Query(f"*=>[KNN {k} @{vector_field} $vec AS score]")
            .sort_by("score")
            .paging(0, k)
            .return_fields(data_field, "score")
            .dialect(3)
        )

        results = client.ft(index_name).search(query, query_params=params)
        print(results)
        return results
