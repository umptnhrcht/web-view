from typing import Dict, List, Any

from redis.commands.search.field import TextField, TagField, VectorField
from redis.commands.search.index_definition import IndexDefinition, IndexType

from .connection import RedisConnector
from data import Embedder


class RedisDataVectorizer:
    @staticmethod
    def parse_attribute(attr_list):
        mapping = dict(zip(attr_list[::2], attr_list[1::2]))
        return {
            "path": attr_list[1],  # JSONPath
            "alias": mapping.get("attribute"),
            "type": mapping.get("type"),
            "weight": float(mapping.get("WEIGHT", 1)) if "WEIGHT" in mapping else None,
        }

    @staticmethod
    def get_index_details(index_name: str) -> dict:
        """
        Fetches index details by name using Redis FT.INFO command.
        """
        conn = RedisConnector.last_connection()
        if not conn:
            raise RuntimeError("No active Redis connection")
        client = conn.get_client()
        if not client:
            raise RuntimeError("No active Redis client")

        info = client.ft(index_name).info()
        attributes = info.get("attributes", [])
        fields = [RedisDataVectorizer.parse_attribute(a) for a in attributes]
        print(info)
        return {
            "index_name": index_name,
            "num_docs": info.get("num_docs"),
            "indexing": info.get("indexing"),
            "fields": fields,
        }

    @staticmethod
    def orchestrate(
        columns: Dict[str, Any], index_name: str, key_prefix: str
    ) -> Dict[str, Any]:
        """
        Orchestrates vectorization and index building in sequence.
        """
        vec_result = RedisDataVectorizer.vectorize(columns, key_prefix)
        idx_result = RedisDataVectorizer.build_index(
            index_name,
            vec_result["newkeyPrefix"],
            vec_result["indexableFields"],
            vec_result["embeddableFields"],
        )
        return {"vectorize": vec_result, "build_index": idx_result}

    @staticmethod
    def vectorize(columns, keyPrefix) -> Dict[str, Any]:
        """
        Fetches all values for keys matching the pattern. If the value type is JSON,
        resends the data under a new key with embeddings added.
        """
        pattern = keyPrefix
        new_key_prefix = "vector:"
        indexable_fields: List[str] = columns["indexable"]
        embeddable_fields: Dict[str, str] = {
            field: f"{field}_embedding" for field in columns["Vectorizable"]
        }

        conn = RedisConnector.last_connection()
        if not conn:
            raise RuntimeError("No active Redis connection")

        client = conn.get_client()
        if not client:
            raise RuntimeError("No active Redis client")

        keys = client.keys(pattern + "*")
        keys = [k.decode("utf-8") if isinstance(k, bytes) else k for k in keys]

        keys_found = len(keys)
        keys_indexed = 0

        for key in keys:
            rtype = client.type(key)
            if rtype == "none":
                try:
                    module_type = client.execute_command("TYPE", key)
                    if module_type == b"ReJSON-RL":
                        rtype = "ReJSON-RL"
                except Exception:
                    pass

            if rtype == "ReJSON-RL":
                value = client.json().get(key)
                if value:
                    indexed = False
                    for field in embeddable_fields:
                        if field in value and isinstance(value[field], str):
                            try:
                                embedding = Embedder.get_embedding(
                                    value[field]
                                ).tolist()
                                value[embeddable_fields[field]] = embedding
                                indexed = True
                            except Exception as e:
                                value[f"{field}_embedding"] = None
                    if indexed:
                        keys_indexed += 1

                # Resend JSON data under new key
                new_key = f"{new_key_prefix}{key}"
                client.json().set(new_key, "$", value)

        return {
            "keysFound": keys_found,
            "keysIndexed": keys_indexed,
            "indexableFields": indexable_fields,
            "embeddableFields": embeddable_fields,
            "newkeyPrefix": new_key_prefix,
        }

    @staticmethod
    def build_index(
        index_name: str,
        key_prefix: str,
        indexable_fields: List[str],
        embeddable_fields: Dict[str, str],
    ) -> Dict[str, Any]:
        """
        Builds a Redis search index for the given key prefix, using text and vector fields.
        """
        conn = RedisConnector.last_connection()
        if not conn:
            raise RuntimeError("No active Redis connection")

        client = conn.get_client()
        if not client:
            raise RuntimeError("No active Redis client")

        # Drop index if exists
        try:
            client.ft(index_name).dropindex(delete_documents=True)
        except Exception:
            pass

        # Build schema
        schema: List[str] = []
        for field in indexable_fields:
            field_text = f"$['{field}']"
            as_name = field.replace(" ", "_")
            schema.append(TextField(field_text, as_name=as_name))

        for field in embeddable_fields.values():
            field_indexname = f"embed_{field.replace(' ', '_')}"
            schema.append(
                VectorField(
                    f"$['{field}']",
                    "FLAT",
                    {"TYPE": "FLOAT32", "DIM": 384, "DISTANCE_METRIC": "COSINE"},
                    as_name=field_indexname,
                )
            )

        # define index
        index_def = IndexDefinition(prefix=[f"{key_prefix}"], index_type=IndexType.JSON)

        client.ft(index_name).create_index(fields=schema, definition=index_def)
        return {
            "indexName": index_name,
            "keyPrefix": key_prefix,
            "textFields": indexable_fields,
            "vectorFields": list(embeddable_fields.values()),
        }
