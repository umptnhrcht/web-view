from redisadapter.query_adapter import QueryAdapter


from flask import Flask, request, jsonify
from flask_cors import CORS
from data import Embedder
from redisadapter.connection import RedisConnector
from redisadapter.infer_data_type import RedisDataInferer
from redisadapter.vectorizer import RedisDataVectorizer

app = Flask(__name__)
CORS(app)


@app.route("/heartbeat", methods=["GET"])
def heartbeat():
    return jsonify({"status": "ok"})


@app.route("/redis/infer", methods=["POST"])
def redis_infer():
    try:
        data = request.get_json() or {}
        pattern = data.get("pattern", "*")
        result = RedisDataInferer.infer(pattern)
        return jsonify({"columns": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/redis/index", methods=["POST"])
def redis_index():
    try:
        data = request.get_json() or {}
        columns = data.get("columns")
        index_name = data.get("indexName", "default_idx")
        key_prefix = data.get("keyPrefix", "new:")
        result = RedisDataVectorizer.orchestrate(columns, index_name, key_prefix)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/redis/index/<index_name>", methods=["GET"])
def get_index_details(index_name):
    try:
        result = RedisDataVectorizer.get_index_details(index_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Semantic KNN search API
@app.route("/redis/search", methods=["POST"])
def redis_search():
    try:
        data = request.get_json() or {}
        index_name = data.get("indexName")
        query = data.get("query")
        vector_fields = data.get("vectorFields", [])
        result_fields = data.get("resultFields", [])
        k = int(data.get("k", 5))
        if not index_name or not query or not vector_fields:
            return jsonify({"error": "Missing required parameters"}), 400
        results = QueryAdapter.multi_knn_search(
            index_name, query, vector_fields, result_fields, k
        )
        # Optionally, serialize results if needed
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/redis/summarize", methods=["POST"])
def search_and_prapare_metadata():
    try:
        data = request.get_json() or {}
        index_name = data.get("indexName")
        query = data.get("query")
        vector_fields = data.get("vectorFields", [])
        result_fields = data.get("resultFields", [])
        k = int(data.get("k", 5))
        if not index_name or not query or not vector_fields:
            return jsonify({"error": "Missing required parameters"}), 400
        context = QueryAdapter.prepare_metadata(
            index_name, query, vector_fields, result_fields, k
        )
        # Optionally, serialize results if needed
        return jsonify({"results": context})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/redis/ping", methods=["POST"])
def redis_ping():
    try:
        params = request.get_json() or {}
        conn = None
        if params:
            conn = RedisConnector.create(params)
        else:
            conn = RedisConnector.last_connection()
        if not conn:
            return jsonify({"error": "No active Redis connection"}), 400
        result = conn.ping()
        return jsonify({"status": "ok" if result else "fail"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/embed", methods=["POST"])
def embed():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    embedding = Embedder.get_instance().get_embedding(text)
    return jsonify({"embedding": embedding.tolist()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5100)
