import type { ClaimsCheckResult } from './types';

export const DEFAULT_BANNED_PHRASES = [
  'cures acne', 'cure acne', 'cures eczema', 'cure eczema', 'cures psoriasis',
  'treats acne', 'treat acne', 'treats eczema', 'treats rosacea',
  'heals skin', 'heal skin', 'heals acne', 'heals eczema',
  'removes acne permanently', 'removes wrinkles permanently', 'removes dark spots permanently',
  'eliminates acne', 'eliminates wrinkles', 'eliminates dark spots',
  'dermatologically proven to cure', 'clinically proven to cure', 'clinically proven to eliminate',
  'dermatologically tested to cure', 'medically approved',
  'prescription strength', 'medical grade', 'pharmaceutical grade',
  'reverses aging', 'reverse aging', 'reverses wrinkles', 'reverse wrinkles',
  'anti-aging miracle', 'miracle cure', 'miracle solution',
  'prevents cancer', 'kills bacteria', 'kills germs',
  'guaranteed to clear', 'guaranteed to remove', '100% removes',
  'no more acne ever', 'no more breakouts ever',
  'repairs damaged skin', 'repairs skin barrier permanently',
  'completely removes', 'permanently removes', 'permanently clears',
  'acne gone', 'wrinkles gone', 'dark spots gone'
];

const SAFE_REPLACEMENTS: Record<string, string> = {
  'cures acne': 'helps reduce the look of breakouts',
  'cure acne': 'help reduce the look of breakouts',
  'treats acne': 'may help support clearer-looking skin',
  'treat acne': 'may help support clearer-looking skin',
  'heals skin': 'supports a healthy-looking complexion',
  'heal skin': 'support a healthy-looking complexion',
  'removes acne permanently': 'may help minimize the appearance of blemishes over time',
  'eliminates acne': 'may help minimize the appearance of blemishes',
  'eliminates dark spots': 'may help reduce the appearance of dark spots over time',
  'removes dark spots': 'may help reduce the appearance of dark spots',
  'reverses aging': 'helps skin look more youthful',
  'reverse aging': 'help skin look more youthful',
  'prevents acne': 'may help support clearer-looking skin',
  'clears acne': 'may help improve the look of blemish-prone skin',
  'kills bacteria': 'formulated with botanicals traditionally associated with cleansing',
  'repairs damaged skin': 'may support the appearance of a healthier skin barrier',
  'acne gone': 'breakouts may appear reduced',
  'dark spots gone': 'dark spots may appear reduced over time',
  'completely removes': 'may help reduce the appearance of',
  'permanently removes': 'may help reduce the appearance of',
};

export const DEFAULT_DISCLAIMER =
  'Results may vary. Not a medical product. For skin concerns, consult a dermatologist.';

export function checkClaims(text: string, extraBanned: string[] = []): ClaimsCheckResult {
  const allBanned = [...DEFAULT_BANNED_PHRASES, ...extraBanned];
  const violations: string[] = [];
  const lower = text.toLowerCase();

  for (const phrase of allBanned) {
    if (lower.includes(phrase.toLowerCase())) {
      violations.push(phrase);
    }
  }

  return {
    isSafe: violations.length === 0,
    violations,
    sanitized: violations.length > 0 ? sanitizeClaims(text) : text,
  };
}

export function sanitizeClaims(text: string): string {
  let safe = text;
  for (const [banned, allowed] of Object.entries(SAFE_REPLACEMENTS)) {
    const regex = new RegExp(banned, 'gi');
    safe = safe.replace(regex, allowed);
  }
  return safe;
}

export function appendDisclaimer(text: string, disclaimer = DEFAULT_DISCLAIMER): string {
  return `${text}\n\n${disclaimer}`;
}
