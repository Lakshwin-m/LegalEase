import sqlite3
import os
from pathlib import Path

db_file = Path(__file__).parent.parent / "legalease.db"

def get_db_connection():
    conn = sqlite3.connect(db_file, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON;')
    return conn

def init_db():
    conn = get_db_connection()
    conn.executescript("""
        CREATE VIRTUAL TABLE IF NOT EXISTS ipc_fts USING fts5(
            section,
            offense,
            punishment,
            description,
            content='ipc_sections'
        );

        CREATE TABLE IF NOT EXISTS ipc_sections (
            id INTEGER PRIMARY KEY,
            section TEXT,
            offense TEXT,
            punishment TEXT,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT REFERENCES sessions(id),
            role TEXT CHECK(role IN ('user', 'assistant')),
            content TEXT,
            sources TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()
