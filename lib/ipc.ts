import db from './db';

export interface IPCSection {
  section: string;
  offense: string;
  punishment: string;
  description: string;
}

export function searchIPC(query: string, limit = 3): IPCSection[] {
  // First try FTS
  const ftsStmt = db.prepare(`
    SELECT section, offense, punishment, description
    FROM ipc_fts
    WHERE ipc_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `);

  try {
    // Basic sanitization for FTS matching
    const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    if (sanitizedQuery) {
      // Create OR matched terms for robust full text searching
      const ftsQuery = sanitizedQuery.split(/\s+/).map(word => `"${word}"*`).join(' OR ');
      
      const results = ftsStmt.all(ftsQuery, limit) as IPCSection[];
      if (results.length > 0) {
        return results;
      }
    }
  } catch (error) {
    console.error('FTS query failed, falling back to LIKE', error);
  }

  // Fallback to LIKE
  const likeStmt = db.prepare(`
    SELECT section, offense, punishment, description
    FROM ipc_sections
    WHERE offense LIKE ? OR description LIKE ?
    LIMIT ?
  `);

  const likeKeyword = `%${query}%`;
  return likeStmt.all(likeKeyword, likeKeyword, limit) as IPCSection[];
}
