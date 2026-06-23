import csv
import os
from pathlib import Path
from .database import get_db_connection

def seed_database(force: bool = False):
    csv_path = Path(__file__).parent.parent / "data" / "ipc_sections.csv"
    if not csv_path.exists():
        print(f"CSV file not found at {csv_path}. Skipping seed.")
        return {"error": f"CSV not found at {csv_path}"}
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM ipc_sections")
    count = cursor.fetchone()[0]
    if count > 0:
        if force:
            cursor.execute("DELETE FROM ipc_sections")
            cursor.execute("DELETE FROM ipc_fts")
        else:
            return {"message": "Database already seeded. Pass force=True to reseed."}
        
    records = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            section = row.get('Section', '').strip()
            if not section:
                continue
            records.append((
                section,
                row.get('Offense', ''),
                row.get('Punishment', ''),
                row.get('Description', '')
            ))
            
    cursor.executemany("""
        INSERT INTO ipc_sections (section, offense, punishment, description)
        VALUES (?, ?, ?, ?)
    """, records)
    
    # Insert into FTS
    cursor.execute("""
        INSERT INTO ipc_fts (rowid, section, offense, punishment, description)
        SELECT id, section, offense, punishment, description FROM ipc_sections
    """)
    
    conn.commit()
    conn.close()
    
    return {"success": True, "message": f"Seeded {len(records)} IPC sections."}
