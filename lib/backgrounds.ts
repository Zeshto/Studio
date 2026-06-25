export interface Background {
  id: number;
  name: string;
  type: 'gradient' | 'solid';
  css: string;
  textColor: 'dark' | 'light';
  accentColor: string;
}

export const BACKGROUNDS: Background[] = [
  {
    id: 0, name: 'Cream Silk',
    type: 'solid',
    css: 'linear-gradient(160deg, #fdf8f2 0%, #fef6ec 60%, #fdf0e0 100%)',
    textColor: 'dark', accentColor: '#7fc9c4',
  },
  {
    id: 1, name: 'Teal Luxe',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0d6b66 0%, #1a8f88 40%, #0a5550 100%)',
    textColor: 'light', accentColor: '#a8ede9',
  },
  {
    id: 2, name: 'Saffron Gold',
    type: 'gradient',
    css: 'linear-gradient(160deg, #b8650a 0%, #d4820e 40%, #8b4a06 100%)',
    textColor: 'light', accentColor: '#fde68a',
  },
  {
    id: 3, name: 'Midnight Black',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 50%, #111111 100%)',
    textColor: 'light', accentColor: '#7fc9c4',
  },
  {
    id: 4, name: 'Rose Luxe',
    type: 'gradient',
    css: 'linear-gradient(160deg, #7b1f3a 0%, #a02850 40%, #5c1529 100%)',
    textColor: 'light', accentColor: '#fecdd3',
  },
  {
    id: 5, name: 'Sage Green',
    type: 'gradient',
    css: 'linear-gradient(160deg, #1e4d2b 0%, #2d6b3c 40%, #163821 100%)',
    textColor: 'light', accentColor: '#bbf7d0',
  },
  {
    id: 6, name: 'Warm Sand',
    type: 'solid',
    css: 'linear-gradient(160deg, #f5e6c8 0%, #f9edd5 50%, #f0ddb8 100%)',
    textColor: 'dark', accentColor: '#7fc9c4',
  },
  {
    id: 7, name: 'Charcoal Studio',
    type: 'gradient',
    css: 'linear-gradient(160deg, #1c1c1c 0%, #2d2d2d 50%, #181818 100%)',
    textColor: 'light', accentColor: '#7fc9c4',
  },
  {
    id: 8, name: 'Lavender Mist',
    type: 'gradient',
    css: 'linear-gradient(160deg, #4a3570 0%, #6b4fa0 40%, #38286e 100%)',
    textColor: 'light', accentColor: '#e9d5ff',
  },
  {
    id: 9, name: 'Sandalwood',
    type: 'gradient',
    css: 'linear-gradient(160deg, #5c3317 0%, #7a4520 40%, #4a2810 100%)',
    textColor: 'light', accentColor: '#fde8c8',
  },
  {
    id: 10, name: 'Pearl White',
    type: 'solid',
    css: 'linear-gradient(160deg, #ffffff 0%, #f8f9fa 50%, #f0f4f8 100%)',
    textColor: 'dark', accentColor: '#7fc9c4',
  },
  {
    id: 11, name: 'Turmeric Gold',
    type: 'gradient',
    css: 'linear-gradient(160deg, #92640a 0%, #b87d0d 40%, #6e4a08 100%)',
    textColor: 'light', accentColor: '#fef08a',
  },
  {
    id: 12, name: 'Blush Pink',
    type: 'solid',
    css: 'linear-gradient(160deg, #fce7f3 0%, #fdf2f8 50%, #f8d7ea 100%)',
    textColor: 'dark', accentColor: '#c96b6b',
  },
  {
    id: 13, name: 'Ocean Deep',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0c4a6e 0%, #0e6091 40%, #083a57 100%)',
    textColor: 'light', accentColor: '#7dd3fc',
  },
  {
    id: 14, name: 'Forest Neem',
    type: 'gradient',
    css: 'linear-gradient(160deg, #14532d 0%, #166534 40%, #0d3d22 100%)',
    textColor: 'light', accentColor: '#86efac',
  },
  {
    id: 15, name: 'Deep Berry',
    type: 'gradient',
    css: 'linear-gradient(160deg, #581c87 0%, #7c3aed 40%, #4c1d95 100%)',
    textColor: 'light', accentColor: '#e9d5ff',
  },
  {
    id: 16, name: 'Ivory Cream',
    type: 'solid',
    css: 'linear-gradient(160deg, #fffbeb 0%, #fefce8 50%, #fef9c3 100%)',
    textColor: 'dark', accentColor: '#92400e',
  },
  {
    id: 17, name: 'Slate Dark',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    textColor: 'light', accentColor: '#7fc9c4',
  },
  {
    id: 18, name: 'Copper Glow',
    type: 'gradient',
    css: 'linear-gradient(160deg, #7c2d12 0%, #c2410c 40%, #6b1e0a 100%)',
    textColor: 'light', accentColor: '#fed7aa',
  },
  {
    id: 19, name: 'Mint Fresh',
    type: 'solid',
    css: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 50%, #dcfce7 100%)',
    textColor: 'dark', accentColor: '#065f46',
  },
  {
    id: 20, name: 'Dark Burgundy',
    type: 'gradient',
    css: 'linear-gradient(160deg, #3b0a1a 0%, #5c1530 50%, #2a0712 100%)',
    textColor: 'light', accentColor: '#fda4af',
  },
  {
    id: 21, name: 'Black Emerald',
    type: 'gradient',
    css: 'linear-gradient(160deg, #022c22 0%, #064e3b 50%, #011a15 100%)',
    textColor: 'light', accentColor: '#6ee7b7',
  },
  {
    id: 22, name: 'Midnight Navy',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0a0f2e 0%, #0d1540 50%, #060a1e 100%)',
    textColor: 'light', accentColor: '#93c5fd',
  },
  {
    id: 23, name: 'Black Gold',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0a0700 0%, #1a1200 50%, #0d0900 100%)',
    textColor: 'light', accentColor: '#fbbf24',
  },
  {
    id: 24, name: 'Deep Plum',
    type: 'gradient',
    css: 'linear-gradient(160deg, #1e0a2e 0%, #2d1045 50%, #140620 100%)',
    textColor: 'light', accentColor: '#d8b4fe',
  },
  {
    id: 25, name: 'Obsidian Teal',
    type: 'gradient',
    css: 'linear-gradient(160deg, #030d0c 0%, #071f1e 50%, #020b0a 100%)',
    textColor: 'light', accentColor: '#5eead4',
  },
  {
    id: 26, name: 'Dark Mahogany',
    type: 'gradient',
    css: 'linear-gradient(160deg, #1c0a00 0%, #2e1200 50%, #140700 100%)',
    textColor: 'light', accentColor: '#fcd34d',
  },
  {
    id: 27, name: 'Midnight Rose',
    type: 'gradient',
    css: 'linear-gradient(160deg, #1a0510 0%, #2d0a1e 50%, #100308 100%)',
    textColor: 'light', accentColor: '#fbcfe8',
  },
  {
    id: 28, name: 'Dark Olive',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0f130a 0%, #1c2211 50%, #0a0e07 100%)',
    textColor: 'light', accentColor: '#bef264',
  },
  {
    id: 29, name: 'Volcanic Black',
    type: 'gradient',
    css: 'linear-gradient(160deg, #0c0500 0%, #1f0d00 50%, #0a0400 100%)',
    textColor: 'light', accentColor: '#fb923c',
  },
  {
    id: 30, name: 'Onyx Sapphire',
    type: 'gradient',
    css: 'linear-gradient(145deg, #05080f 0%, #0a1428 45%, #060c1c 100%)',
    textColor: 'light', accentColor: '#60a5fa',
  },
  {
    id: 31, name: 'Carbon Rose',
    type: 'gradient',
    css: 'linear-gradient(145deg, #100208 0%, #1e0412 45%, #0c0106 100%)',
    textColor: 'light', accentColor: '#f9a8d4',
  },
  {
    id: 32, name: 'Dark Saffron',
    type: 'gradient',
    css: 'linear-gradient(145deg, #120800 0%, #251200 45%, #0e0500 100%)',
    textColor: 'light', accentColor: '#fcd34d',
  },
  {
    id: 33, name: 'Obsidian Violet',
    type: 'gradient',
    css: 'linear-gradient(145deg, #0d0514 0%, #1a0b26 45%, #08030e 100%)',
    textColor: 'light', accentColor: '#c084fc',
  },
  {
    id: 34, name: 'Black Jade',
    type: 'gradient',
    css: 'linear-gradient(145deg, #020f0c 0%, #061c17 45%, #010a08 100%)',
    textColor: 'light', accentColor: '#34d399',
  },
  {
    id: 35, name: 'Midnight Copper',
    type: 'gradient',
    css: 'linear-gradient(145deg, #0f0400 0%, #1e0a00 45%, #0a0200 100%)',
    textColor: 'light', accentColor: '#fb923c',
  },
  {
    id: 36, name: 'Deep Indigo',
    type: 'gradient',
    css: 'linear-gradient(145deg, #050821 0%, #0c1240 45%, #030615 100%)',
    textColor: 'light', accentColor: '#a5b4fc',
  },
  {
    id: 37, name: 'Black Sandalwood',
    type: 'gradient',
    css: 'linear-gradient(145deg, #0c0600 0%, #1c0f00 45%, #080400 100%)',
    textColor: 'light', accentColor: '#fde68a',
  },
];
