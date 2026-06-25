import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { dbQuery, dbExecute } from '@/lib/db';
import { DEFAULT_BANNED_PHRASES, DEFAULT_DISCLAIMER } from '@/lib/claimsFilter';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const rows = await dbQuery<{ key: string; value: unknown }>(
      'SELECT key, value FROM settings'
    );

    const settings: Record<string, unknown> = {
      bannedPhrases: DEFAULT_BANNED_PHRASES,
      disclaimer: DEFAULT_DISCLAIMER,
      logoUrl: '',
    };

    for (const row of rows) {
      settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({
      bannedPhrases: DEFAULT_BANNED_PHRASES,
      disclaimer: DEFAULT_DISCLAIMER,
      logoUrl: '',
    });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const body = await req.json();
    for (const [key, value] of Object.entries(body)) {
      await dbExecute(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 });
  }
}
