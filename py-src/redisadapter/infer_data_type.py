import random
import json
from typing import List, Dict, Any

from .connection import RedisConnector


class RedisDataInferer:
    """
    Fetch keys from Redis and infers JSON column types.
    """

    @staticmethod
    def infer(pattern: str) -> List[Dict[str, Any]]:
        conn = RedisConnector.last_connection()
        if not conn:
            raise RuntimeError("No active Redis connection")
        client = conn.get_client()
        if not client:
            raise RuntimeError("No active Redis client")

        # Use KEYS for simplicity (SCAN recommended for production)
        keys = client.keys(pattern + "*")
        keys = [k for k in keys]

        # Limit to 50 results
        if len(keys) > 50:
            keys = keys[:50]

        # Pick up to 5 random keys
        picked = random.sample(keys, min(5, len(keys)))

        results = []
        for key in picked:
            rtype = "none"
            value = None
            try:
                rtype = client.type(key)
                if rtype == "none":
                    # Try detecting ReJSON module
                    try:
                        module_type = client.execute_command("TYPE", key)
                        if module_type == b"ReJSON-RL":
                            rtype = "ReJSON-RL"
                    except Exception:
                        pass

                if rtype == "string":
                    value = client.get(key)
                    if isinstance(value, bytes):
                        value = value
                elif rtype == "hash":
                    value = {
                        k.decode(): v.decode() for k, v in client.hgetall(key).items()
                    }
                elif rtype == "list":
                    value = [v.decode() for v in client.lrange(key, 0, -1)]
                elif rtype == "set":
                    value = [v.decode() for v in client.smembers(key)]
                elif rtype == "zset":
                    value = [v.decode() for v in client.zrange(key, 0, -1)]
                elif rtype == "ReJSON-RL":
                    value = client.json().get(key)
                else:
                    value = None
            except Exception:
                value = None

            results.append({"key": key, "type": rtype, "value": value})

        print("Results:", results)

        # Infer column types only for JSON objects
        column_types: Dict[str, set] = {}
        for item in results:
            if item["type"] != "ReJSON-RL" or not isinstance(item["value"], dict):
                continue
            for k, v in item["value"].items():
                val_type = "array" if isinstance(v, list) else type(v).__name__
                if k not in column_types:
                    column_types[k] = set()
                column_types[k].add(val_type)

        # Format result
        inferred_columns = [
            {"column": k, "types": list(v)} for k, v in column_types.items()
        ]
        return inferred_columns
