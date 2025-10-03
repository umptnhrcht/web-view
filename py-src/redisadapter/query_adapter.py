from typing import List, Any

import heapq

from .connection import RedisConnector
from data import Embedder
from redis.commands.search.query import Query


class QueryAdapter:
    @staticmethod
    def knn_search(
        index_name: str, query_text: str, vector_field: str, data_field: str, results_per_field: int = 5
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
            Query(f"*=>[KNN {results_per_field} @{vector_field} $vec AS score]")
            .sort_by("score")
            .paging(0, results_per_field)
            .return_fields(data_field, "score")
            .dialect(3)
        )

        results = client.ft(index_name).search(query, query_params=params)
        print(results)
        return results


    @staticmethod
    def multi_knn_search(
        index_name: str,
        query_text: str,
        vector_fields: list,
        results_per_field: int = 3,
        max_results: int = 5,
    ) -> list:
        """
        Performs individual KNN search over all vector_fields using knn_search.
        Returns a list of top max_results records (across all fields) sorted by score.
        """
        all_results = []
        counter = 0
        for field in vector_fields:
            # knn_search returns a result object, expected to have .docs attribute (list of docs)
            field_results = QueryAdapter.knn_search(index_name, query_text, field, results_per_field)
            docs = getattr(field_results, 'docs', field_results)  # fallback if .docs missing
            for doc in docs:
                score = float(doc.score)
                heapq.heappush(all_results, (-score, counter, doc))  # add counter as tiebreaker
                counter += 1

        # Get top max_results
        top_results = [heapq.heappop(all_results)[2] for _ in range(min(max_results, len(all_results)))]
        serializable_results = []

        for doc in top_results:
            if hasattr(doc, 'to_dict'):
                serializable_results.append(doc.to_dict())
            elif hasattr(doc, '__dict__'):
                # Remove private attributes and methods
                serializable_results.append({k: v for k, v in doc.__dict__.items() if not k.startswith('_') and not callable(v)})
            elif isinstance(doc, dict):
                serializable_results.append(doc)
            else:
                serializable_results.append(str(doc))
        return serializable_results