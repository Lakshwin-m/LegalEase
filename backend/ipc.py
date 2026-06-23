import re
from .database import get_db_connection

def search_ipc(query: str, limit: int = 3):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Sanitize query: keep alphanumeric
    sanitized_query = re.sub(r'[^a-zA-Z0-9\s]', '', query).strip()
    
    if sanitized_query:
        # Create FTS matching syntax: "word1"* OR "word2"*
        words = sanitized_query.split()
        fts_query = " OR ".join([f'"{w}"*' for w in words])
        
        try:
            cursor.execute("""
                SELECT section, offense, punishment, description
                FROM ipc_fts
                WHERE ipc_fts MATCH ?
                ORDER BY rank
                LIMIT ?
            """, (fts_query, limit))
            
            results = cursor.fetchall()
            if results:
                return [dict(r) for r in results]
        except Exception as e:
            print("FTS match failed", e)
            
    # Fallback to LIKE
    like_query = f"%{query}%"
    cursor.execute("""
        SELECT section, offense, punishment, description
        FROM ipc_sections
        WHERE offense LIKE ? OR description LIKE ?
        LIMIT ?
    """, (like_query, like_query, limit))
    
    results = cursor.fetchall()
    return [dict(r) for r in results]
