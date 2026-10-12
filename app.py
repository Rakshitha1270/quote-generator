from flask import Flask, render_template, jsonify, request
import sqlite3
import requests
from datetime import datetime

app = Flask(__name__)
DB_NAME = "quotes.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote TEXT NOT NULL,
            author TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/quote")
def get_quote():
    try:
        response = requests.get("https://dummyjson.com/quotes/random", timeout=10)
        response.raise_for_status()
        data = response.json()
        return jsonify({
            "quote": data.get("quote", ""),
            "author": data.get("author", "Unknown")
        })
    except requests.RequestException:
        return jsonify({"error": "Unable to fetch quote right now."}), 500

@app.route("/api/favorites", methods=["GET"])
def get_favorites():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT id, quote, author, created_at FROM favorites ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route("/api/favorites", methods=["POST"])
def add_favorite():
    data = request.get_json(silent=True) or {}
    quote = data.get("quote", "").strip()
    author = data.get("author", "Unknown").strip()

    if not quote:
        return jsonify({"error": "Quote is required"}), 400

    conn = sqlite3.connect(DB_NAME)
    conn.execute(
        "INSERT INTO favorites (quote, author, created_at) VALUES (?, ?, ?)",
        (quote, author or "Unknown", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Favorite saved successfully"}), 201

@app.route("/api/favorites/<int:favorite_id>", methods=["DELETE"])
def delete_favorite(favorite_id):
    conn = sqlite3.connect(DB_NAME)
    conn.execute("DELETE FROM favorites WHERE id = ?", (favorite_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Favorite deleted"})

init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
