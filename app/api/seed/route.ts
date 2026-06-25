import { NextRequest, NextResponse } from 'next/server';
import { initDb, dbExecute, dbQuery } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { generateAllPosts } from '@/lib/contentEngine';
import { getAllProducts } from '@/lib/pkb';
import { DEFAULT_BANNED_PHRASES, DEFAULT_DISCLAIMER } from '@/lib/claimsFilter';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.SEED_SECRET || 'zeshto-seed-2024';

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid seed secret.' }, { status: 403 });
  }

  try {
    // 1. Create tables
    await initDb();

    // 2. Create owner user
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@zeshto.com';
    const ownerPassword = process.env.OWNER_PASSWORD || 'Zeshto@2024!';

    const hash = await hashPassword(ownerPassword);
    const existing = await dbQuery('SELECT id FROM users WHERE email = $1', [ownerEmail]);
    if (existing.length === 0) {
      await dbExecute(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
        [ownerEmail, hash]
      );
    } else {
      await dbExecute(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [hash, ownerEmail]
      );
    }

    // 3. Seed products from PKB
    const products = getAllProducts();
    for (const product of products) {
      await dbExecute(
        `INSERT INTO products (id, data) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
        [product.id, JSON.stringify(product)]
      );
    }

    // 4. Generate and store 150 posts
    const posts = generateAllPosts();
    for (const post of posts) {
      await dbExecute(
        `INSERT INTO posts (id, day_number, data) VALUES ($1, $2, $3)
         ON CONFLICT (day_number) DO NOTHING`,
        [post.id, post.dayNumber, JSON.stringify(post)]
      );
    }

    // 5. Store default settings
    await dbExecute(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      ['bannedPhrases', JSON.stringify(DEFAULT_BANNED_PHRASES)]
    );
    await dbExecute(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      ['disclaimer', JSON.stringify(DEFAULT_DISCLAIMER)]
    );
    await dbExecute(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      ['logoUrl', JSON.stringify('')]
    );

    return NextResponse.json({
      ok: true,
      message: `Seeded successfully! ${products.length} products, ${posts.length} posts.`,
      loginWith: { email: ownerEmail, note: 'Use the OWNER_PASSWORD you set in your .env file.' },
    });
  } catch (err: unknown) {
    console.error('Seed error:', err);
    return NextResponse.json(
      { error: 'Seed failed.', detail: String(err) },
      { status: 500 }
    );
  }
}
