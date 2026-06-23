import re
from .database import get_db_connection

def search_ipc(query: str, limit: int = 5):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Step 1: Try to extract a section number from the query (e.g. "376B", "IPC_376B", "section 302")
    section_patterns = [
        r'IPC[_\s-]*(\d+[A-Za-z]*)',           # IPC_376B, IPC 376B, IPC-376B
        r'section[_\s-]*(\d+[A-Za-z]*)',        # section 376B, section_376B
        r'\b(\d{1,4}[A-Za-z]{0,2})\b',          # bare number like 376B, 302
    ]
    
    section_num = None
    for pattern in section_patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            section_num = match.group(1).upper()
            break
    
    # Step 2: If we found a section number, search the section column directly
    if section_num:
        # Try exact match on section column (format is IPC_302, IPC_376B etc.)
        section_key = f"IPC_{section_num}"
        cursor.execute("""
            SELECT section, offense, punishment, description
            FROM ipc_sections
            WHERE section = ? COLLATE NOCASE
            LIMIT ?
        """, (section_key, limit))
        
        results = cursor.fetchall()
        if results:
            conn.close()
            return [dict(r) for r in results]
        
        # Try partial match on section column
        cursor.execute("""
            SELECT section, offense, punishment, description
            FROM ipc_sections
            WHERE section LIKE ? COLLATE NOCASE
            LIMIT ?
        """, (f"%{section_num}%", limit))
        
        results = cursor.fetchall()
        if results:
            conn.close()
            return [dict(r) for r in results]
    
    # Step 3: FTS full-text search on content
    sanitized_query = re.sub(r'[^a-zA-Z0-9\s]', '', query).strip()
    
    if sanitized_query:
        words = [w for w in sanitized_query.split() if len(w) > 2]  # skip tiny words
        if words:
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
                    conn.close()
                    return [dict(r) for r in results]
            except Exception as e:
                print("FTS match failed", e)
            
    # Step 4: Fallback to LIKE on offense and description
    like_query = f"%{query}%"
    cursor.execute("""
        SELECT section, offense, punishment, description
        FROM ipc_sections
        WHERE offense LIKE ? OR description LIKE ? OR section LIKE ?
        LIMIT ?
    """, (like_query, like_query, like_query, limit))
    
    results = cursor.fetchall()
    conn.close()
    return [dict(r) for r in results]
