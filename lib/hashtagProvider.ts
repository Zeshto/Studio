import hashtagData from '../data/hashtags.json';
import type { Platform } from './types';

interface HashtagPool {
  broad: string[];
  broadMid: string[];
  mid: string[];
  local: string[];
  byIngredient: Record<string, string[]>;
  byConcern: Record<string, string[]>;
  linkedin: string[];
}

const pool = hashtagData as HashtagPool;

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

export function getInstagramHashtags(
  heroIngredients: string[],
  skinConcerns: string[],
  seedIndex: number
): string[] {
  // Mix strategy: 1 broad + 1 broadMid + 1 mid + 1 niche-ingredient + 1 local/concern
  const broad = pick(pool.broad, seedIndex);
  const broadMid = pick(pool.broadMid, seedIndex + 1);
  const mid = pick(pool.mid, seedIndex + 2);

  // ingredient-specific
  const ingredientKey = heroIngredients[0]?.toLowerCase().replace(/\s+/g, '-');
  const ingredientPool =
    pool.byIngredient[ingredientKey] || pool.byIngredient['turmeric'];
  const ingredientTag = pick(ingredientPool, seedIndex + 3);

  // concern-specific
  const concernKey = skinConcerns[0]?.toLowerCase().replace(/\s+/g, '-').replace('acne', 'acne');
  const normalizedConcernKey = Object.keys(pool.byConcern).find(k =>
    concernKey?.includes(k.replace('-', '')) || k.includes(concernKey?.split('-')[0] || '')
  ) || 'glow';
  const concernTag = pick(pool.byConcern[normalizedConcernKey] || pool.byConcern['glow'], seedIndex + 4);

  return [broad, broadMid, mid, ingredientTag, concernTag];
}

export function getLinkedinHashtags(seedIndex: number): string[] {
  return [
    pick(pool.linkedin.slice(0, 4), seedIndex),
    pick(pool.linkedin.slice(4, 8), seedIndex + 1),
    pick(pool.linkedin.slice(6, 10), seedIndex + 2),
  ];
}

export function getYoutubeTags(
  productName: string,
  heroIngredients: string[],
  skinConcerns: string[]
): string[] {
  const base = [
    productName,
    `${productName} soap`,
    'handmade soap India',
    'natural soap',
    'cold process soap',
    'Zeshto soap',
    'Indian skincare',
    'Ayurvedic soap',
  ];
  const ingredientTags = heroIngredients.map(i => `${i} skincare`);
  const concernTags = skinConcerns.map(c => `${c} skincare`);
  return [...base, ...ingredientTags, ...concernTags].slice(0, 15);
}
