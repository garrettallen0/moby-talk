export const AVAILABLE_THEMES = [
  'Ahab',
  'Ishmael',
  'Ishmael & Ahab',
  'Queequeeg'
] as const;

export type Theme = typeof AVAILABLE_THEMES[number]; 