import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const sessions = db.prepare(`
      SELECT id, title, created_at, updated_at
      FROM sessions
      ORDER BY updated_at DESC
    `).all();

    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body.title || 'New Chat';
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO sessions (id, title)
      VALUES (?, ?)
    `).run(id, title);

    return NextResponse.json({ id, title });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
