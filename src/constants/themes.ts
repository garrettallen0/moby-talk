export const AVAILABLE_THEMES = [
  'Ahab',
  'Ishmael',
  'Ishmael & Ahab',
  'Queequeeg'
] as const;

export type Theme = typeof AVAILABLE_THEMES[number];

export const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue',
} as const; 