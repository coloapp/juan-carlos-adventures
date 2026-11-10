/**
 * LetterTracingScreen.js - Módulo de Trazado de Letras y Caligrafía Escolar
 * Digitalización interactiva y fiel del cuadernillo físico de preescolar (SEP / Gonvill).
 * 
 * Arquitectura:
 * - Menú inicial con 10 Subjuegos en Círculos (como en Sílabas):
 *   1. "CUADERNILLO: LAS 5 VOCALES" (50 niveles: A, E, I, O, U, réplica de las páginas del libro, diptongos y maestría).
 *   2. "CUADERNILLO: CONSONANTES" (50 niveles: M, S, T, L, P, N, R, C, D... sobre cuadrícula).
 *   3 a 9. Juegos individuales por letra: M, S, T, L, P, N, R (50 niveles cada uno).
 *   10. "PIZARRA MÁGICA ESCOLAR" (Cuaderno abierto con cuadrícula escolar y crayones de colores).
 * - Motor de Trazo Infantil Realista:
 *   - Donde el niño pasa su dedito se raya/pinta en tiempo real como un crayón físico sobre papel.
 *   - Detección inteligente de cobertura: no importa si el niño traza "chuequito", al cubrir el trazo se auto-rellena limpiamente con un hermoso efecto de destello de estrellitas doradas.
 *   - En los niveles de inicio de letra (Nivel 1), el dibujo sorpresa (Árbol, Elefante, etc.) se colorea automáticamente al terminar la mayúscula y la minúscula.
 *   - En los renglones sobre cuadrícula, cada letra trazada se llena y brilla en el renglón del cuaderno.
 * - Cero alertas emergentes (alert/confirm), transición automática fluida y asistente ARABOT centrado.
 */
import { StorageManager } from '../core/StorageManager.js';
import { audio } from '../core/AudioManager.js';
import { rewards } from '../core/RewardManager.js';
import { Confetti } from '../components/Confetti.js';
import { LevelSelector } from '../components/LevelSelector.js';
import { ArabotAssistant } from '../components/ArabotAssistant.js';
import { getPedagogicalLetter } from '../core/LetterWaypoints.js';

// ============================================================================
// 1. CATÁLOGO DE LOS 10 SUB-JUEGOS EN CÍRCULOS (50 NIVELES CADA UNO)
// ============================================================================
export const TRACING_SUBGAMES = [
  {
    id: 'vocales_cuadernillo',
    moduleKey: 'tracing_vocales_workbook',
    title: 'CUADERNILLO: LAS 5 VOCALES',
    subtitle: 'A, E, I, O, U • Réplica fiel del libro físico',
    icon: '📖',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#e91e63',
    description: 'Digitalización nivel a nivel: letra grande con dibujo sorpresa, renglones caligráficos sobre cuadrícula y combinaciones.'
  },
  {
    id: 'consonantes_cuadernillo',
    moduleKey: 'tracing_consonantes_workbook',
    title: 'CUADERNILLO: CONSONANTES',
    subtitle: 'M, S, T, L, P, N, R, C, D... sobre cuadrícula',
    icon: '🔤',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#1976d2',
    description: 'Aprende a trazar las consonantes del cuadernillo escolar y sus renglones caligráficos.'
  },
  {
    id: 'letra_m',
    moduleKey: 'tracing_letra_m',
    title: 'LETRA M',
    subtitle: 'Mamá • Ma, Me, Mi, Mo, Mu',
    icon: '🍎',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#e53935',
    description: 'Trazos de la letra M y sus sílabas con la Manzana.'
  },
  {
    id: 'letra_s',
    moduleKey: 'tracing_letra_s',
    title: 'LETRA S',
    subtitle: 'Sol, Sapo • Sa, Se, Si, So, Su',
    icon: '☀️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#ff9800',
    description: 'Trazos ondulados y divertidos de la letra S con el Sol.'
  },
  {
    id: 'letra_t',
    moduleKey: 'tracing_letra_t',
    title: 'LETRA T',
    subtitle: 'Tortuga • Ta, Te, Ti, To, Tu',
    icon: '🐢',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#43a047',
    description: 'Trazos rectos y firmes de la letra T con la Tortuga.'
  },
  {
    id: 'letra_l',
    moduleKey: 'tracing_letra_l',
    title: 'LETRA L',
    subtitle: 'León, Luna • La, Le, Li, Lo, Lu',
    icon: '🦁',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#fbc02d',
    description: 'Trazos altos y elegantes de la letra L con el León.'
  },
  {
    id: 'letra_p',
    moduleKey: 'tracing_letra_p',
    title: 'LETRA P',
    subtitle: 'Pelota, Papá • Pa, Pe, Pi, Po, Pu',
    icon: '⚽',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-s',
    themeColor: '#8e24aa',
    description: 'Trazos de poste y pancita redonda de la letra P con la Pelota.'
  },
  {
    id: 'letra_n',
    moduleKey: 'tracing_letra_n',
    title: 'LETRA N',
    subtitle: 'Nube, Nido • Na, Ne, Ni, No, Nu',
    icon: '☁️',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-vocales',
    themeColor: '#00acc1',
    description: 'Trazos de arquito de la letra N con la Nube.'
  },
  {
    id: 'letra_r',
    moduleKey: 'tracing_letra_r',
    title: 'LETRA R',
    subtitle: 'Ratón, Rana • Ra, Re, Ri, Ro, Ru',
    icon: '🐭',
    totalLevels: 50,
    bubbleClass: 'subgame-bubble-m',
    themeColor: '#d81b60',
    description: 'Trazos con gancho y fuerza de la letra R con el Ratón.'
  },
  {
    id: 'pizarra_magica',
    moduleKey: 'tracing_pizarra_magica',
    title: 'PIZARRA MÁGICA ESCOLAR',
    subtitle: 'Dibujo libre y práctica con 6 crayones',
    icon: '🎨',
    totalLevels: 1,
    bubbleClass: 'subgame-bubble-arma',
    themeColor: '#3949ab',
    description: 'Cuaderno abierto con cuadrícula escolar y crayones de colores para trazar y dibujar libremente.'
  }
];

// ============================================================================
// 2. NIVELES PEDAGÓGICOS DEL CUADERNILLO DE VOCALES (50 NIVELES EXACTOS AL LIBRO)
// ============================================================================
export const VOCALES_WORKBOOK_LEVELS = [
  // --- LETRA A (Página 3 del Cuadernillo Físico - Imágenes 1 a 5) ---
  {
    id: 1,
    type: 'intro_hollow',
    letter: 'A',
    lowercase: 'a',
    word: 'ÁRBOL',
    phonetic: 'A de Árbol',
    icon: '🌳',
    title: 'A de Árbol • Letra Grande',
    instruction: '✏️ Traza la A y la a con tu dedito para colorear el Árbol.'
  },
  {
    id: 2,
    type: 'grid_row',
    char: 'A',
    count: 8,
    title: 'Renglón 1: Letra A Mayúscula',
    instruction: '✏️ Traza las 8 letras A sobre la cuadrícula del cuaderno.'
  },
  {
    id: 3,
    type: 'grid_row',
    char: 'a',
    count: 12,
    title: 'Renglón 2: Letra a Minúscula',
    instruction: '✏️ Traza las 12 letras a redonditas con su palito vertical.'
  },
  {
    id: 4,
    type: 'grid_row',
    char: 'A',
    count: 8,
    title: 'Renglón 3: Refuerzo de A Mayúscula',
    instruction: '✏️ Refuerza tu caligrafía trazando las 8 letras A.'
  },
  {
    id: 5,
    type: 'grid_row_alternating',
    pattern: ['A', 'a', 'A', 'a', 'A', 'a', 'A', 'a', 'A', 'a'],
    title: 'Renglón 4: Alternado A - a',
    instruction: '✏️ Traza alternando una A mayúscula y una a minúscula.'
  },

  // --- LETRA E (Elefante) ---
  {
    id: 6,
    type: 'intro_hollow',
    letter: 'E',
    lowercase: 'e',
    word: 'ELEFANTE',
    phonetic: 'E de Elefante',
    icon: '🐘',
    title: 'E de Elefante • Letra Grande',
    instruction: '✏️ Traza la E y la e con tu dedito para colorear el Elefante.'
  },
  {
    id: 7,
    type: 'grid_row',
    char: 'E',
    count: 8,
    title: 'Renglón 1: Letra E Mayúscula',
    instruction: '✏️ Traza las 8 letras E sobre la cuadrícula del cuaderno.'
  },
  {
    id: 8,
    type: 'grid_row',
    char: 'e',
    count: 12,
    title: 'Renglón 2: Letra e Minúscula',
    instruction: '✏️ Traza las 12 letras e sobre la cuadrícula.'
  },
  {
    id: 9,
    type: 'grid_row',
    char: 'E',
    count: 8,
    title: 'Renglón 3: Refuerzo de E Mayúscula',
    instruction: '✏️ Refuerza tu caligrafía trazando las 8 letras E.'
  },
  {
    id: 10,
    type: 'grid_row_alternating',
    pattern: ['E', 'e', 'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e'],
    title: 'Renglón 4: Alternado E - e',
    instruction: '✏️ Traza alternando una E mayúscula y una e minúscula.'
  },

  // --- LETRA I (Isla) ---
  {
    id: 11,
    type: 'intro_hollow',
    letter: 'I',
    lowercase: 'i',
    word: 'ISLA',
    phonetic: 'I de Isla',
    icon: '🏝️',
    title: 'I de Isla • Letra Grande',
    instruction: '✏️ Traza la I y la i con su puntito para colorear la Isla.'
  },
  {
    id: 12,
    type: 'grid_row',
    char: 'I',
    count: 8,
    title: 'Renglón 1: Letra I Mayúscula',
    instruction: '✏️ Traza las 8 letras I sobre la cuadrícula del cuaderno.'
  },
  {
    id: 13,
    type: 'grid_row',
    char: 'i',
    count: 12,
    title: 'Renglón 2: Letra i Minúscula',
    instruction: '✏️ Traza las 12 letras i con su puntito flotante.'
  },
  {
    id: 14,
    type: 'grid_row',
    char: 'I',
    count: 8,
    title: 'Renglón 3: Refuerzo de I Mayúscula',
    instruction: '✏️ Refuerza tu caligrafía trazando la I.'
  },
  {
    id: 15,
    type: 'grid_row_alternating',
    pattern: ['I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i'],
    title: 'Renglón 4: Alternado I - i',
    instruction: '✏️ Traza alternando una I mayúscula y una i minúscula.'
  },

  // --- LETRA O (Oso) ---
  {
    id: 16,
    type: 'intro_hollow',
    letter: 'O',
    lowercase: 'o',
    word: 'OSO',
    phonetic: 'O de Oso',
    icon: '🐻',
    title: 'O de Oso • Letra Grande',
    instruction: '✏️ Traza la O y la o redonditas para colorear el Oso.'
  },
  {
    id: 17,
    type: 'grid_row',
    char: 'O',
    count: 8,
    title: 'Renglón 1: Letra O Mayúscula',
    instruction: '✏️ Traza los 8 círculos grandes de la O.'
  },
  {
    id: 18,
    type: 'grid_row',
    char: 'o',
    count: 12,
    title: 'Renglón 2: Letra o Minúscula',
    instruction: '✏️ Traza los 12 círculos pequeños de la o.'
  },
  {
    id: 19,
    type: 'grid_row',
    char: 'O',
    count: 8,
    title: 'Renglón 3: Refuerzo de O Mayúscula',
    instruction: '✏️ Refuerza tu caligrafía trazando la O.'
  },
  {
    id: 20,
    type: 'grid_row_alternating',
    pattern: ['O', 'o', 'O', 'o', 'O', 'o', 'O', 'o', 'O', 'o'],
    title: 'Renglón 4: Alternado O - o',
    instruction: '✏️ Traza alternando una O mayúscula y una o minúscula.'
  },

  // --- LETRA U (Uva) ---
  {
    id: 21,
    type: 'intro_hollow',
    letter: 'U',
    lowercase: 'u',
    word: 'UVA',
    phonetic: 'U de Uva',
    icon: '🍇',
    title: 'U de Uva • Letra Grande',
    instruction: '✏️ Traza la U y la u con tu dedito para colorear las Uvas.'
  },
  {
    id: 22,
    type: 'grid_row',
    char: 'U',
    count: 8,
    title: 'Renglón 1: Letra U Mayúscula',
    instruction: '✏️ Traza las 8 curvas de la U sobre la cuadrícula.'
  },
  {
    id: 23,
    type: 'grid_row',
    char: 'u',
    count: 12,
    title: 'Renglón 2: Letra u Minúscula',
    instruction: '✏️ Traza las 12 letras u con su patita derecha.'
  },
  {
    id: 24,
    type: 'grid_row',
    char: 'U',
    count: 8,
    title: 'Renglón 3: Refuerzo de U Mayúscula',
    instruction: '✏️ Refuerza tu caligrafía con la letra U.'
  },
  {
    id: 25,
    type: 'grid_row_alternating',
    pattern: ['U', 'u', 'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u'],
    title: 'Renglón 4: Alternado U - u',
    instruction: '✏️ Traza alternando U mayúscula y u minúscula.'
  },

  // --- NIVELES 26 A 30: REPASO Y COMBINACIÓN DE LAS 5 VOCALES ---
  {
    id: 26,
    type: 'grid_row_alternating',
    pattern: ['A', 'E', 'I', 'O', 'U', 'A', 'E', 'I', 'O', 'U'],
    title: 'Renglón: Las 5 Vocales Mayúsculas',
    instruction: '✏️ Traza la serie completa de las 5 vocales mayúsculas: A, E, I, O, U.'
  },
  {
    id: 27,
    type: 'grid_row_alternating',
    pattern: ['a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u'],
    title: 'Renglón: Las 5 Vocales Minúsculas',
    instruction: '✏️ Traza la serie de las 5 vocales minúsculas: a, e, i, o, u.'
  },
  {
    id: 28,
    type: 'grid_row_alternating',
    pattern: ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u'],
    title: 'Renglón: Parejas Vocal Mayúscula y Minúscula',
    instruction: '✏️ Traza cada vocal con su mayúscula y su minúscula.'
  },
  {
    id: 29,
    type: 'grid_row_alternating',
    pattern: ['A', 'E', 'O', 'A', 'E', 'O', 'A', 'E', 'O', 'A'],
    title: 'Renglón: Vocales Fuertes (A, E, O)',
    instruction: '✏️ Traza el ritmo de vocales abiertas: A, E, O.'
  },
  {
    id: 30,
    type: 'grid_row_alternating',
    pattern: ['I', 'U', 'I', 'U', 'I', 'U', 'I', 'U', 'I', 'U'],
    title: 'Renglón: Vocales Débiles (I, U)',
    instruction: '✏️ Traza el ritmo de vocales cerradas: I, U.'
  },

  // --- NIVELES 31 A 35: DIPTONGOS Y ENLACES VOCÁLICOS ---
  {
    id: 31,
    type: 'grid_row_alternating',
    pattern: ['A', 'I', 'A', 'I', 'A', 'I', 'A', 'I'],
    title: 'Diptongo: A - I',
    instruction: '✏️ Traza la combinación A - I en el cuaderno.'
  },
  {
    id: 32,
    type: 'grid_row_alternating',
    pattern: ['A', 'U', 'A', 'U', 'A', 'U', 'A', 'U'],
    title: 'Diptongo: A - U (Auto)',
    instruction: '✏️ Traza la combinación A - U sobre la cuadrícula.'
  },
  {
    id: 33,
    type: 'grid_row_alternating',
    pattern: ['E', 'I', 'E', 'I', 'E', 'I', 'E', 'I'],
    title: 'Diptongo: E - I (Peine)',
    instruction: '✏️ Traza la combinación E - I en el cuaderno.'
  },
  {
    id: 34,
    type: 'grid_row_alternating',
    pattern: ['E', 'U', 'E', 'U', 'E', 'U', 'E', 'U'],
    title: 'Diptongo: E - U',
    instruction: '✏️ Traza la combinación E - U sobre la cuadrícula.'
  },
  {
    id: 35,
    type: 'grid_row_alternating',
    pattern: ['O', 'I', 'O', 'I', 'O', 'I', 'O', 'I'],
    title: 'Diptongo: O - I (Oigo)',
    instruction: '✏️ Traza la combinación O - I en el renglón.'
  },

  // --- NIVELES 36 A 40: DIPTONGOS CRECIENTES ---
  {
    id: 36,
    type: 'grid_row_alternating',
    pattern: ['I', 'A', 'I', 'A', 'I', 'A', 'I', 'A'],
    title: 'Diptongo: I - A (Piano)',
    instruction: '✏️ Traza la combinación I - A en el cuaderno.'
  },
  {
    id: 37,
    type: 'grid_row_alternating',
    pattern: ['I', 'E', 'I', 'E', 'I', 'E', 'I', 'E'],
    title: 'Diptongo: I - E (Cielo)',
    instruction: '✏️ Traza la combinación I - E en el renglón.'
  },
  {
    id: 38,
    type: 'grid_row_alternating',
    pattern: ['I', 'O', 'I', 'O', 'I', 'O', 'I', 'O'],
    title: 'Diptongo: I - O (Avión)',
    instruction: '✏️ Traza la combinación I - O en la cuadrícula.'
  },
  {
    id: 39,
    type: 'grid_row_alternating',
    pattern: ['U', 'A', 'U', 'A', 'U', 'A', 'U', 'A'],
    title: 'Diptongo: U - A (Agua)',
    instruction: '✏️ Traza la combinación U - A en el cuaderno.'
  },
  {
    id: 40,
    type: 'grid_row_alternating',
    pattern: ['U', 'E', 'U', 'E', 'U', 'E', 'U', 'E'],
    title: 'Diptongo: U - E (Fuego)',
    instruction: '✏️ Traza la combinación U - E en el renglón.'
  },

  // --- NIVELES 41 A 45: RÁFAGAS DE VELOCIDAD CALIGRÁFICA ---
  {
    id: 41,
    type: 'grid_row',
    char: 'A',
    count: 8,
    title: 'Ráfaga Caligráfica: Letra A',
    instruction: '✏️ Traza las 8 letras A con firmeza y ritmo.'
  },
  {
    id: 42,
    type: 'grid_row',
    char: 'E',
    count: 8,
    title: 'Ráfaga Caligráfica: Letra E',
    instruction: '✏️ Traza las 8 letras E en el cuaderno.'
  },
  {
    id: 43,
    type: 'grid_row',
    char: 'I',
    count: 8,
    title: 'Ráfaga Caligráfica: Letra I',
    instruction: '✏️ Traza las 8 letras I sobre la cuadrícula.'
  },
  {
    id: 44,
    type: 'grid_row',
    char: 'O',
    count: 8,
    title: 'Ráfaga Caligráfica: Letra O',
    instruction: '✏️ Traza los 8 círculos de la letra O.'
  },
  {
    id: 45,
    type: 'grid_row',
    char: 'U',
    count: 8,
    title: 'Ráfaga Caligráfica: Letra U',
    instruction: '✏️ Traza las 8 curvas de la letra U.'
  },

  // --- NIVELES 46 A 50: GRAN MAESTRO DE LAS VOCALES ---
  {
    id: 46,
    type: 'grid_row_alternating',
    pattern: ['A', 'E', 'I', 'O', 'U', 'A', 'E', 'I', 'O', 'U'],
    title: 'Gran Maestro: Serie Directa',
    instruction: '✏️ Traza la secuencia A - E - I - O - U dos veces.'
  },
  {
    id: 47,
    type: 'grid_row_alternating',
    pattern: ['U', 'O', 'I', 'E', 'A', 'U', 'O', 'I', 'E', 'A'],
    title: 'Gran Maestro: Serie Inversa',
    instruction: '✏️ Traza la secuencia inversa: U - O - I - E - A.'
  },
  {
    id: 48,
    type: 'grid_row_alternating',
    pattern: ['a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u'],
    title: 'Gran Maestro: Minúsculas Rápidas',
    instruction: '✏️ Traza todas las vocales minúsculas con tu dedito.'
  },
  {
    id: 49,
    type: 'grid_row_alternating',
    pattern: ['u', 'o', 'i', 'e', 'a', 'u', 'o', 'i', 'e', 'a'],
    title: 'Gran Maestro: Minúsculas Inversas',
    instruction: '✏️ Traza la serie de minúsculas al revés: u - o - i - e - a.'
  },
  {
    id: 50,
    type: 'grid_row_alternating',
    pattern: ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u'],
    title: '¡Desafío Final del Cuadernillo de Vocales!',
    instruction: '🌟 ¡Felicidades! Completa el último renglón de las vocales escolares.'
  }
];

// ============================================================================
// 3. GENERADOR DE NIVELES PARA CONSONANTES Y SUB-JUEGOS INDIVIDUALES
// ============================================================================
export const CONSONANTES_CATALOG = [
  { char: 'M', word: 'MANZANA', icon: '🍎', phonetic: 'M de Manzana' },
  { char: 'S', word: 'SOL', icon: '☀️', phonetic: 'S de Sol' },
  { char: 'T', word: 'TORTUGA', icon: '🐢', phonetic: 'T de Tortuga' },
  { char: 'L', word: 'LEÓN', icon: '🦁', phonetic: 'L de León' },
  { char: 'P', word: 'PELOTA', icon: '⚽', phonetic: 'P de Pelota' },
  { char: 'N', word: 'NUBE', icon: '☁️', phonetic: 'N de Nube' },
  { char: 'R', word: 'RATÓN', icon: '🐭', phonetic: 'R de Ratón' },
  { char: 'C', word: 'CASA', icon: '🏡', phonetic: 'C de Casa' },
  { char: 'D', word: 'DADO', icon: '🎲', phonetic: 'D de Dado' }
];

export function buildLetter50Levels(letterInfo) {
  const c = letterInfo.char;
  const lower = c.toLowerCase();
  const levels = [];

  // Nivel 1: Letra grande hueca con dibujo sorpresa
  levels.push({
    id: 1,
    type: 'intro_hollow',
    letter: c,
    lowercase: lower,
    word: letterInfo.word,
    phonetic: letterInfo.phonetic,
    icon: letterInfo.icon,
    title: `${letterInfo.phonetic} • Letra Grande`,
    instruction: `✏️ Traza la ${c} y la ${lower} con tu dedito para colorear la sorpresa.`
  });

  // Nivel 2: Renglón mayúsculas (8)
  levels.push({
    id: 2,
    type: 'grid_row',
    char: c,
    count: 8,
    title: `Renglón 1: Letra ${c} Mayúscula`,
    instruction: `✏️ Traza las 8 letras ${c} sobre la cuadrícula del cuaderno.`
  });

  // Nivel 3: Renglón minúsculas (12)
  levels.push({
    id: 3,
    type: 'grid_row',
    char: lower,
    count: 12,
    title: `Renglón 2: Letra ${lower} Minúscula`,
    instruction: `✏️ Traza las 12 letras ${lower} sobre la cuadrícula.`
  });

  // Nivel 4: Refuerzo mayúsculas (8)
  levels.push({
    id: 4,
    type: 'grid_row',
    char: c,
    count: 8,
    title: `Renglón 3: Refuerzo de ${c}`,
    instruction: `✏️ Refuerza tu caligrafía trazando la ${c}.`
  });

  // Nivel 5: Alternado mayúscula / minúscula (8 a 10)
  levels.push({
    id: 5,
    type: 'grid_row_alternating',
    pattern: [c, lower, c, lower, c, lower, c, lower],
    title: `Renglón 4: Alternado ${c} - ${lower}`,
    instruction: `✏️ Traza alternando ${c} mayúscula y ${lower} minúscula.`
  });

  // Niveles 6 a 50: Sílabas, combinaciones y desafíos caligráficos
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const lowerVowels = ['a', 'e', 'i', 'o', 'u'];

  for (let i = 6; i <= 50; i++) {
    const vIdx = (i - 6) % 5;
    const v = vowels[vIdx];
    const lv = lowerVowels[vIdx];

    if (i <= 10) {
      // Sílabas directas (ej: M A M A M A M A)
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [c, v, c, v, c, v, c, v],
        title: `Renglón Sílaba: ${c}${v}`,
        instruction: `✏️ Traza la sílaba ${c}${v} sobre la cuadrícula.`
      });
    } else if (i <= 15) {
      // Sílabas minúsculas (ej: m a m a m a m a)
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [lower, lv, lower, lv, lower, lv, lower, lv],
        title: `Renglón Sílaba Minúscula: ${lower}${lv}`,
        instruction: `✏️ Traza las sílabas minúsculas ${lower}${lv}.`
      });
    } else if (i <= 20) {
      // Repaso de mayúsculas en ráfaga
      levels.push({
        id: i,
        type: 'grid_row',
        char: c,
        count: 8,
        title: `Caligrafía de Refuerzo: Letra ${c}`,
        instruction: `✏️ Traza las 8 letras ${c} con precisión.`
      });
    } else if (i <= 25) {
      // Repaso de minúsculas en ráfaga
      levels.push({
        id: i,
        type: 'grid_row',
        char: lower,
        count: 12,
        title: `Caligrafía de Refuerzo: Letra ${lower}`,
        instruction: `✏️ Traza las 12 letras ${lower} redonditas.`
      });
    } else {
      // Caligrafía avanzada y ráfagas (26..50)
      const altChar = (i % 2 === 0) ? c : lower;
      levels.push({
        id: i,
        type: 'grid_row_alternating',
        pattern: [c, lower, c, lower, c, lower, c, lower],
        title: `Desafío de Caligrafía ${i}: Letra ${c}`,
        instruction: `✏️ Completa el renglón ${i} del cuaderno escolar.`
      });
    }
  }

  return levels;
}

// Generador de los 50 niveles del Cuadernillo de Consonantes
export const CONSONANTES_WORKBOOK_LEVELS = (() => {
  const allLevels = [];
  let idCounter = 1;

  CONSONANTES_CATALOG.forEach(item => {
    // 1 intro + 3 renglones por consonante
    allLevels.push({
      id: idCounter++,
      type: 'intro_hollow',
      letter: item.char,
      lowercase: item.char.toLowerCase(),
      word: item.word,
      phonetic: item.phonetic,
      icon: item.icon,
      title: `${item.phonetic} • Letra Grande`,
      instruction: `✏️ Traza la ${item.char} y la ${item.char.toLowerCase()} para colorear la sorpresa.`
    });

    allLevels.push({
      id: idCounter++,
      type: 'grid_row',
      char: item.char,
      count: 8,
      title: `Renglón: ${item.char} Mayúscula`,
      instruction: `✏️ Traza las 8 letras ${item.char} sobre la cuadrícula.`
    });

    allLevels.push({
      id: idCounter++,
      type: 'grid_row',
      char: item.char.toLowerCase(),
      count: 12,
      title: `Renglón: ${item.char.toLowerCase()} Minúscula`,
      instruction: `✏️ Traza las 12 letras ${item.char.toLowerCase()} en el renglón.`
    });

    allLevels.push({
      id: idCounter++,
      type: 'grid_row_alternating',
      pattern: [item.char, item.char.toLowerCase(), item.char, item.char.toLowerCase(), item.char, item.char.toLowerCase(), item.char, item.char.toLowerCase()],
      title: `Renglón Alternado: ${item.char} - ${item.char.toLowerCase()}`,
      instruction: `✏️ Traza alternando ${item.char} mayúscula y minúscula.`
    });
  });

  // Rellenar hasta 50 niveles con desafíos de maestría caligráfica
  while (allLevels.length < 50) {
    const idx = (allLevels.length % CONSONANTES_CATALOG.length);
    const item = CONSONANTES_CATALOG[idx];
    allLevels.push({
      id: idCounter++,
      type: 'grid_row_alternating',
      pattern: [item.char, item.char.toLowerCase(), item.char, item.char.toLowerCase(), item.char, item.char.toLowerCase(), item.char, item.char.toLowerCase()],
      title: `Maestro de Consonantes: ${item.char}`,
      instruction: `✏️ Demuestra tu caligrafía trazando el renglón de ${item.char}.`
    });
  }

  return allLevels.slice(0, 50);
})();

// Diccionario de niveles de los 10 juegos
export const SUBGAMES_LEVEL_MAP = {
  vocales_cuadernillo: VOCALES_WORKBOOK_LEVELS,
  consonantes_cuadernillo: CONSONANTES_WORKBOOK_LEVELS,
  letra_m: buildLetter50Levels(CONSONANTES_CATALOG[0]),
  letra_s: buildLetter50Levels(CONSONANTES_CATALOG[1]),
  letra_t: buildLetter50Levels(CONSONANTES_CATALOG[2]),
  letra_l: buildLetter50Levels(CONSONANTES_CATALOG[3]),
  letra_p: buildLetter50Levels(CONSONANTES_CATALOG[4]),
  letra_n: buildLetter50Levels(CONSONANTES_CATALOG[5]),
  letra_r: buildLetter50Levels(CONSONANTES_CATALOG[6])
};

// ============================================================================
// 4. CLASE PRINCIPAL: LETTER TRACING SCREEN
// ============================================================================
export class LetterTracingScreen {
  constructor(appNavigator) {
    this.navigator = appNavigator;
    this.student = StorageManager.getActiveStudent();

    // Estado de navegación
    this.activeSubgame = null; // null = menú de 10 juegos en círculos
    this.currentLevel = null;  // 1..50

    // Datos del nivel activo
    this.levelConfig = null;
    this.pedagogicalData = null;

    // Asistente ARABOT
    this.arabot = null;

    // Lienzos HTML5
    this.bgCanvas = null;
    this.bgCtx = null;
    this.paintCanvas = null;
    this.paintCtx = null;
    this.fxCanvas = null;
    this.fxCtx = null;

    // Estado de trazo
    this.isDrawing = false;
    this.lastPoint = null;
    this.activeCrayonColor = '#ff5722'; // Naranja crayón

    // Estado de cobertura
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };
    this.isIllustrationColored = false;
    this.rowLettersCompleted = [];
    this.totalRowLetters = 0;

    // Partículas de estrellitas mágicas
    this.sparkles = [];
    this.animFrameId = null;

    // Eventos
    this.activePointerId = null;
    this.boundPointerUp = null;
    this.boundPointerMove = null;
  }

  // ==========================================================================
  // ORQUESTADOR PRINCIPAL DE VISTAS
  // ==========================================================================
  render(container) {
    this.student = StorageManager.getActiveStudent();
    this.cleanup();

    // Vista 1: Menú inicial con los 10 juegos en círculos
    if (this.activeSubgame === null) {
      this.renderSubgamesMenu(container);
      return;
    }

    // Vista 2: Pizarra Mágica Libre
    if (this.activeSubgame === 'pizarra_magica') {
      this.renderPizarraMagica(container);
      return;
    }

    // Vista 3: Selector de niveles (50 círculos)
    if (this.currentLevel === null) {
      this.renderLevelSelector(container);
      return;
    }

    // Vista 4: Nivel activo del cuadernillo
    this.renderLevelGame(container);
  }

  // ==========================================================================
  // VISTA 1: MENÚ DE 10 JUEGOS EN CÍRCULOS (COMO EN SÍLABAS)
  // ==========================================================================
  renderSubgamesMenu(container) {
    const student = StorageManager.getActiveStudent();

    container.innerHTML = `
      <div class="module-container notebook-grid-bg fade-in" id="tracingSubgamesMenu">
        <!-- Encabezado con efecto frosted glass -->
        <header class="module-header">
          <button class="back-btn" id="btnBackToHome">⬅️ Menú Principal</button>
          
          <div style="text-align:center;">
            <h2 style="color:#0d47a1; margin:0; font-size:clamp(1.2rem, 3.2vw, 1.8rem);">CUADERNILLO DE TRAZOS</h2>
            <div style="font-size:0.85rem; font-weight:bold; color:#e65100;">
              Elige una actividad en círculo para comenzar • 50 Niveles
            </div>
          </div>

          <div class="score-box">⭐ ${student.stars || 0}</div>
        </header>

        <!-- Cuadrícula de 10 juegos en círculos -->
        <main class="subgames-menu-container">
          <div class="subgames-grid-10">
            ${TRACING_SUBGAMES.map(game => {
              const prog = StorageManager.getModuleLevels(game.moduleKey);
              const completedCount = Object.keys(prog.completed || {}).length;
              return `
                <button class="subgame-circle-card" data-game="${game.id}">
                  <div class="subgame-bubble ${game.bubbleClass} pulse-glow">
                    <span class="subgame-bubble-icon">${game.icon}</span>
                    <span class="subgame-levels-badge">${game.totalLevels} ${game.totalLevels > 1 ? 'Niveles' : 'Actividad'}</span>
                  </div>
                  <span class="subgame-title-label" style="color:${game.themeColor};">${game.title}</span>
                  <span style="font-size:0.75rem; color:#455a64; font-weight:bold; margin-top:3px;">
                    ${game.totalLevels > 1 ? `⭐ ${completedCount}/${game.totalLevels} completados` : 'Libre para dibujar'}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </main>

        <!-- Pie Informativo -->
        <footer class="module-footer">
          <span class="tip-text">💡 Toca <strong>Cuadernillo: Las 5 Vocales</strong> para avanzar nivel por nivel en las páginas del libro.</span>
        </footer>
      </div>
    `;

    container.querySelector('#btnBackToHome')?.addEventListener('click', () => {
      audio.playClick();
      this.cleanup();
      this.navigator.navigate('home');
    });

    container.querySelectorAll('.subgame-circle-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        const gameId = e.currentTarget.dataset.game;
        this.activeSubgame = gameId;
        this.currentLevel = (gameId === 'pizarra_magica') ? 1 : null;
        this.render(container);
      });
    });

    audio.speak('Elige un juego del cuadernillo de trazos');
  }

  // ==========================================================================
  // VISTA 2: SELECTOR DE 50 NIVELES EN CÍRCULOS
  // ==========================================================================
  renderLevelSelector(container) {
    const subgame = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];

    LevelSelector.render({
      container,
      moduleKey: subgame.moduleKey,
      totalLevels: subgame.totalLevels,
      title: subgame.title,
      icon: subgame.icon,
      onBack: () => {
        audio.playClick();
        this.activeSubgame = null;
        this.currentLevel = null;
        this.render(container);
      },
      onSelectLevel: (levelNum) => {
        audio.playClick();
        this.currentLevel = levelNum;
        this.renderLevelGame(container);
      }
    });
  }

  // ==========================================================================
  // VISTA 3: NIVEL ACTIVO DEL CUADERNILLO ESCOLAR
  // ==========================================================================
  renderLevelGame(container) {
    this.cleanup();

    const levels = SUBGAMES_LEVEL_MAP[this.activeSubgame] || VOCALES_WORKBOOK_LEVELS;
    const idx = Math.max(0, Math.min(this.currentLevel - 1, levels.length - 1));
    this.levelConfig = levels[idx];

    const isIntro = (this.levelConfig.type === 'intro_hollow');
    const letterChar = this.levelConfig.letter || this.levelConfig.char || 'A';
    this.pedagogicalData = getPedagogicalLetter(letterChar);

    // Reinicio de estados del nivel
    this.isDrawing = false;
    this.lastPoint = null;
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };
    this.isIllustrationColored = false;

    if (this.levelConfig.type === 'grid_row') {
      this.totalRowLetters = this.levelConfig.count || 8;
      this.rowLettersCompleted = new Array(this.totalRowLetters).fill(false);
    } else if (this.levelConfig.type === 'grid_row_alternating') {
      this.totalRowLetters = this.levelConfig.pattern.length;
      this.rowLettersCompleted = new Array(this.totalRowLetters).fill(false);
    }

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="tracingModule">
        <!-- Encabezado con ARABOT centrado para no estorbar botones -->
        <header class="tracing-header">
          <button class="back-btn" id="btnBackToLevels">⬅️ Niveles</button>
          
          <div class="arabot-top-anchor" id="arabotAnchor">
            <!-- ARABOT se monta aquí -->
          </div>

          <div class="header-actions">
            <button class="sound-btn" id="btnPlayLetterAudio">🔊 Escuchar</button>
            <button class="clear-btn" id="btnClearCanvas">🧹 Borrar</button>
          </div>
        </header>

        <!-- Cuadernillo de Trabajo estilo Hoja Escolar -->
        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>${this.levelConfig.title.toUpperCase()}</h2>
            <p class="notebook-instruction" id="levelInstructionText">
              ${this.levelConfig.instruction || '✏️ Pasa tu dedito sobre las líneas punteadas como un crayón.'}
            </p>
          </div>

          <div class="notebook-grid-container" id="notebookGridContainer">
            <!-- Lienzos superpuestos alineados a 760x420 -->
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>

            <!-- Zona de la Sorpresa ilustrada (Árbol, Elefante, etc. solo en nivel intro) -->
            ${isIntro ? `
              <div class="notebook-tree-zone" id="notebookTreeZone">
                ${this.pedagogicalData.getSurpriseSvg()}
                <div class="tree-caption" id="treeCaption">${this.pedagogicalData.phonetic} ${this.pedagogicalData.icon}</div>
              </div>
            ` : `
              <div class="row-progress-counter" id="rowProgressCounter">
                ⭐ Letras: <span id="completedCountLabel">0</span> / ${this.totalRowLetters}
              </div>
            `}
          </div>
        </main>

        <!-- Banner de transición automática -->
        <div class="auto-transition-banner" id="autoTransitionBanner" style="display:none;">
          <div class="transition-card bounce-in">
            <div class="transition-stars">⭐⭐⭐</div>
            <div class="transition-title">¡EXCELENTE!</div>
            <div class="transition-msg" id="transitionMsg">¡Completaste este ejercicio del cuadernillo!</div>
            <div class="transition-progress-bar">
              <div class="progress-fill" id="transitionProgressFill"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupArabot(container);
    this.setupCanvases(container);
    this.drawBackground();
    this.startFxLoop();
    this.bindEvents(container);

    // Instrucción de voz amigable
    setTimeout(() => {
      audio.speak(this.levelConfig.instruction || `Vamos a trazar la letra ${letterChar}`);
    }, 400);
  }

  setupArabot(container) {
    const anchor = container.querySelector('#arabotAnchor');
    if (!anchor) return;

    this.arabot = new ArabotAssistant({
      onHelpClick: () => {
        this.playArabotHint();
      }
    });

    this.arabot.mount(anchor);
  }

  playArabotHint() {
    if (!this.arabot) return;
    if (this.levelConfig.type === 'intro_hollow') {
      this.arabot.speak(`¡Pasa tu dedito siguiendo las flechas 1, 2 y 3 para colorear el ${this.pedagogicalData.word}!`);
    } else {
      this.arabot.speak(`¡Traza cada letra sobre los puntitos del renglón con tu dedito!`);
    }
    this.arabot.bounceHead();
  }

  setupCanvases(container) {
    this.bgCanvas = container.querySelector('#bgCanvas');
    this.paintCanvas = container.querySelector('#paintCanvas');
    this.fxCanvas = container.querySelector('#fxCanvas');

    if (!this.bgCanvas || !this.paintCanvas || !this.fxCanvas) return;

    this.bgCtx = this.bgCanvas.getContext('2d');
    this.paintCtx = this.paintCanvas.getContext('2d');
    this.fxCtx = this.fxCanvas.getContext('2d');
  }

  // ==========================================================================
  // DIBUJO DEL FONDO: CUADRÍCULA AZUL + CONTORNOS HUECOS O RENGLÓN PUNTEADO
  // ==========================================================================
  drawBackground() {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Cuadrícula escolar con líneas azules suaves (38px x 38px auténticas de cuaderno)
    const gridSize = 38;
    ctx.save();
    ctx.strokeStyle = 'rgba(41, 182, 246, 0.22)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Renderizar según el tipo de nivel del libro
    if (this.levelConfig.type === 'intro_hollow') {
      this.drawIntroHollowLetters(ctx, W, H);
    } else if (this.levelConfig.type === 'grid_row') {
      this.drawGridRowDotted(ctx, W, H, this.levelConfig.char, this.levelConfig.count);
    } else if (this.levelConfig.type === 'grid_row_alternating') {
      this.drawGridRowAlternating(ctx, W, H, this.levelConfig.pattern);
    }
  }

  /**
   * NIVEL TIPO 1: Letra grande hueca con flechas 1, 2, 3 (Imagen 1 del libro)
   */
  drawIntroHollowLetters(ctx, W, H) {
    const upperStrokes = this.pedagogicalData.uppercaseStrokes || [];
    const lowerStrokes = this.pedagogicalData.lowercaseStrokes || [];
    const allStrokes = [...upperStrokes, ...lowerStrokes];

    // Borde exterior negro grueso
    ctx.save();
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 46;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.renderStrokes(ctx, allStrokes, W, H);
    ctx.restore();

    // Canal hueco interior blanco
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.renderStrokes(ctx, allStrokes, W, H);
    ctx.restore();

    // Punto especial para la minúscula de la letra i
    allStrokes.forEach(s => {
      if (s.isDot && s.points[0]) {
        const p = s.points[0];
        ctx.save();
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Líneas punteadas centrales
    allStrokes.forEach(stroke => {
      if (stroke.isDot) return;
      const pts = stroke.points;
      if (!pts || pts.length < 2) return;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#546e7a';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([7, 6]);
      pts.forEach((p, idx) => {
        const x = p.x * W;
        const y = p.y * H;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    });

    // Insignias circulares numeradas (1, 2, 3...) y flechas
    allStrokes.forEach(stroke => {
      const pts = stroke.points;
      if (!pts || pts.length === 0) return;

      const p0 = pts[0];
      const sx = p0.x * W;
      const sy = p0.y * H;

      // Círculo blanco con borde
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Número
      ctx.fillStyle = '#111111';
      ctx.font = '900 13px "Fredoka", "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${stroke.label}`, sx, sy);

      // Flecha de dirección
      if (!stroke.isDot && pts.length >= 2) {
        const p1 = pts[1];
        const nx = p1.x * W;
        const ny = p1.y * H;
        const midX = sx + (nx - sx) * 0.42;
        const midY = sy + (ny - sy) * 0.42;
        this.drawArrow(ctx, sx, sy, midX, midY);
      }
      ctx.restore();
    });
  }

  renderStrokes(ctx, strokes, W, H) {
    strokes.forEach(s => {
      if (s.isDot) return;
      const pts = s.points;
      if (!pts || pts.length < 2) return;
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = p.x * W;
        const y = p.y * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  drawArrow(ctx, fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.fillStyle = '#212121';
    ctx.translate(toX, toY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-11, -6);
    ctx.lineTo(-11, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * NIVEL TIPO 2: Renglón caligráfico escolar con letras punteadas (Imágenes 2, 3 y 4 del libro)
   */
  drawGridRowDotted(ctx, W, H, char, count) {
    const topY = 115;
    const midY = 215;
    const baseY = 315;

    // Renglón de cuaderno con líneas guía
    this.drawNotebookRowLines(ctx, W, topY, midY, baseY);

    const isUpper = (char === char.toUpperCase() && char !== char.toLowerCase());
    const stepX = W / count;

    for (let i = 0; i < count; i++) {
      const cx = (i + 0.5) * stepX;
      this.drawSingleDottedLetter(ctx, char, cx, topY, midY, baseY, isUpper);
    }
  }

  /**
   * NIVEL TIPO 3: Renglón alternado (Imagen 5 del libro: A a A a A a...)
   */
  drawGridRowAlternating(ctx, W, H, pattern) {
    const topY = 115;
    const midY = 215;
    const baseY = 315;

    this.drawNotebookRowLines(ctx, W, topY, midY, baseY);

    const count = pattern.length;
    const stepX = W / count;

    for (let i = 0; i < count; i++) {
      const char = pattern[i];
      const isUpper = (char === char.toUpperCase() && char !== char.toLowerCase());
      const cx = (i + 0.5) * stepX;
      this.drawSingleDottedLetter(ctx, char, cx, topY, midY, baseY, isUpper);
    }
  }

  drawNotebookRowLines(ctx, W, topY, midY, baseY) {
    ctx.save();
    // Fondo tenue del renglón
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, topY, W, baseY - topY);

    // Línea superior del renglón
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(W, topY);
    ctx.stroke();

    // Línea media discontinua
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();

    // Línea base del renglón
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(W, baseY);
    ctx.stroke();
    ctx.restore();
  }

  drawSingleDottedLetter(ctx, char, cx, topY, midY, baseY, isUpper) {
    ctx.save();
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2.8;
    ctx.setLineDash([5, 4]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const c = char.toUpperCase();

    if (isUpper) {
      // Letras Mayúsculas (ocupan de baseY a topY)
      if (c === 'A') {
        ctx.beginPath();
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx - 26, baseY);
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx + 26, baseY);
        ctx.moveTo(cx - 15, midY);
        ctx.lineTo(cx + 15, midY);
        ctx.stroke();
      } else if (c === 'E') {
        ctx.beginPath();
        ctx.moveTo(cx - 20, topY + 5);
        ctx.lineTo(cx - 20, baseY);
        ctx.moveTo(cx - 20, topY + 5);
        ctx.lineTo(cx + 20, topY + 5);
        ctx.moveTo(cx - 20, midY);
        ctx.lineTo(cx + 14, midY);
        ctx.moveTo(cx - 20, baseY);
        ctx.lineTo(cx + 20, baseY);
        ctx.stroke();
      } else if (c === 'I') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx + 18, topY + 5);
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx, baseY);
        ctx.moveTo(cx - 18, baseY);
        ctx.lineTo(cx + 18, baseY);
        ctx.stroke();
      } else if (c === 'O') {
        ctx.beginPath();
        ctx.ellipse(cx, midY, 26, 92, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c === 'U') {
        ctx.beginPath();
        ctx.moveTo(cx - 22, topY + 5);
        ctx.lineTo(cx - 22, baseY - 35);
        ctx.quadraticCurveTo(cx - 22, baseY, cx, baseY);
        ctx.quadraticCurveTo(cx + 22, baseY, cx + 22, baseY - 35);
        ctx.lineTo(cx + 22, topY + 5);
        ctx.stroke();
      } else if (c === 'M') {
        ctx.beginPath();
        ctx.moveTo(cx - 24, baseY);
        ctx.lineTo(cx - 24, topY + 5);
        ctx.lineTo(cx, midY + 15);
        ctx.lineTo(cx + 24, topY + 5);
        ctx.lineTo(cx + 24, baseY);
        ctx.stroke();
      } else if (c === 'S') {
        ctx.beginPath();
        ctx.moveTo(cx + 18, topY + 18);
        ctx.quadraticCurveTo(cx, topY, cx - 12, topY + 25);
        ctx.quadraticCurveTo(cx - 16, midY, cx, midY);
        ctx.quadraticCurveTo(cx + 18, midY, cx + 14, baseY - 20);
        ctx.quadraticCurveTo(cx, baseY + 4, cx - 18, baseY - 16);
        ctx.stroke();
      } else if (c === 'T') {
        ctx.beginPath();
        ctx.moveTo(cx - 22, topY + 5);
        ctx.lineTo(cx + 22, topY + 5);
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx, baseY);
        ctx.stroke();
      } else if (c === 'L') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx - 18, baseY);
        ctx.lineTo(cx + 20, baseY);
        ctx.stroke();
      } else if (c === 'P') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx - 18, baseY);
        ctx.moveTo(cx - 18, topY + 5);
        ctx.quadraticCurveTo(cx + 24, topY + 5, cx + 24, midY);
        ctx.quadraticCurveTo(cx + 24, midY + 15, cx - 18, midY + 15);
        ctx.stroke();
      } else if (c === 'N') {
        ctx.beginPath();
        ctx.moveTo(cx - 22, baseY);
        ctx.lineTo(cx - 22, topY + 5);
        ctx.lineTo(cx + 22, baseY);
        ctx.lineTo(cx + 22, topY + 5);
        ctx.stroke();
      } else if (c === 'R') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx - 18, baseY);
        ctx.moveTo(cx - 18, topY + 5);
        ctx.quadraticCurveTo(cx + 22, topY + 5, cx + 22, midY);
        ctx.quadraticCurveTo(cx + 22, midY + 12, cx - 18, midY + 12);
        ctx.moveTo(cx - 2, midY + 12);
        ctx.lineTo(cx + 22, baseY);
        ctx.stroke();
      } else {
        // Fallback punteado genérico mayúscula
        ctx.font = 'bold 115px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.strokeText(char, cx, baseY - 8);
      }
    } else {
      // Letras Minúsculas (ocupan de baseY a midY)
      if (c === 'A') {
        ctx.beginPath();
        ctx.arc(cx - 3, midY + 48, 20, 0, Math.PI * 2);
        ctx.moveTo(cx + 17, midY + 5);
        ctx.lineTo(cx + 17, baseY);
        ctx.stroke();
      } else if (c === 'E') {
        ctx.beginPath();
        ctx.moveTo(cx - 16, midY + 48);
        ctx.lineTo(cx + 16, midY + 48);
        ctx.arc(cx, midY + 48, 18, 0, Math.PI * 1.7, true);
        ctx.stroke();
      } else if (c === 'I') {
        ctx.beginPath();
        ctx.moveTo(cx, midY + 25);
        ctx.lineTo(cx, baseY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.arc(cx, midY + 10, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (c === 'O') {
        ctx.beginPath();
        ctx.arc(cx, midY + 48, 20, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c === 'U') {
        ctx.beginPath();
        ctx.moveTo(cx - 15, midY + 10);
        ctx.lineTo(cx - 15, baseY - 20);
        ctx.quadraticCurveTo(cx - 15, baseY, cx, baseY);
        ctx.quadraticCurveTo(cx + 15, baseY, cx + 15, baseY - 20);
        ctx.lineTo(cx + 15, midY + 10);
        ctx.moveTo(cx + 15, midY + 10);
        ctx.lineTo(cx + 15, baseY);
        ctx.stroke();
      } else if (c === 'M') {
        ctx.beginPath();
        ctx.moveTo(cx - 20, midY + 10);
        ctx.lineTo(cx - 20, baseY);
        ctx.moveTo(cx - 20, midY + 25);
        ctx.quadraticCurveTo(cx - 10, midY + 10, cx, midY + 25);
        ctx.lineTo(cx, baseY);
        ctx.moveTo(cx, midY + 25);
        ctx.quadraticCurveTo(cx + 10, midY + 10, cx + 20, midY + 25);
        ctx.lineTo(cx + 20, baseY);
        ctx.stroke();
      } else if (c === 'S') {
        ctx.beginPath();
        ctx.moveTo(cx + 12, midY + 20);
        ctx.quadraticCurveTo(cx, midY + 10, cx - 8, midY + 24);
        ctx.quadraticCurveTo(cx - 10, midY + 45, cx, midY + 45);
        ctx.quadraticCurveTo(cx + 12, midY + 45, cx + 8, baseY - 10);
        ctx.quadraticCurveTo(cx, baseY + 4, cx - 12, baseY - 8);
        ctx.stroke();
      } else if (c === 'T') {
        ctx.beginPath();
        ctx.moveTo(cx, midY - 15);
        ctx.lineTo(cx, baseY - 10);
        ctx.quadraticCurveTo(cx, baseY, cx + 12, baseY);
        ctx.moveTo(cx - 12, midY + 15);
        ctx.lineTo(cx + 12, midY + 15);
        ctx.stroke();
      } else if (c === 'L') {
        ctx.beginPath();
        ctx.moveTo(cx, topY + 10);
        ctx.lineTo(cx, baseY);
        ctx.stroke();
      } else if (c === 'P') {
        ctx.beginPath();
        ctx.moveTo(cx - 14, midY + 10);
        ctx.lineTo(cx - 14, baseY + 45);
        ctx.arc(cx, midY + 45, 18, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c === 'N') {
        ctx.beginPath();
        ctx.moveTo(cx - 15, midY + 10);
        ctx.lineTo(cx - 15, baseY);
        ctx.moveTo(cx - 15, midY + 25);
        ctx.quadraticCurveTo(cx, midY + 10, cx + 15, midY + 25);
        ctx.lineTo(cx + 15, baseY);
        ctx.stroke();
      } else if (c === 'R') {
        ctx.beginPath();
        ctx.moveTo(cx - 12, midY + 10);
        ctx.lineTo(cx - 12, baseY);
        ctx.moveTo(cx - 12, midY + 25);
        ctx.quadraticCurveTo(cx, midY + 10, cx + 14, midY + 15);
        ctx.stroke();
      } else {
        // Fallback punteado genérico minúscula
        ctx.font = 'bold 75px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.strokeText(char, cx, baseY - 6);
      }
    }
    ctx.restore();
  }

  // ==========================================================================
  // MANEJO DE ENTRADA TÁCTIL Y DE RATÓN: PINTADO DE CRAYÓN EN TIEMPO REAL
  // ==========================================================================
  bindEvents(container) {
    container.querySelector('#btnBackToLevels')?.addEventListener('click', () => {
      audio.playClick();
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearCanvas')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    container.querySelector('#btnPlayLetterAudio')?.addEventListener('click', () => {
      audio.speak(`Letra ${this.levelConfig.letter || this.levelConfig.char}, ${this.pedagogicalData.phonetic}`);
      if (this.arabot) this.arabot.bounceHead();
    });

    const canvas = this.paintCanvas;
    if (!canvas) return;

    // Pointer Events universales (ratón, dedos táctiles en tablets y stylus)
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.activePointerId = e.pointerId;
      const pt = this.getCanvasPoint(e);
      this.handlePointerDown(pt.x, pt.y);
    }, { passive: false });

    this.boundPointerMove = (e) => {
      e.preventDefault();
      if (!this.isDrawing || (this.activePointerId !== null && e.pointerId !== this.activePointerId)) return;
      const pt = this.getCanvasPoint(e);
      this.handlePointerMove(pt.x, pt.y);
    };

    this.boundPointerUp = (e) => {
      if (this.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== this.activePointerId) return;
      this.activePointerId = null;
      this.handlePointerUp();
    };

    canvas.addEventListener('pointermove', this.boundPointerMove, { passive: false });
    canvas.addEventListener('pointerup', this.boundPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', this.boundPointerUp, { passive: false });
  }

  getCanvasPoint(e) {
    const canvas = this.paintCanvas;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handlePointerDown(x, y) {
    this.isDrawing = true;
    this.lastPoint = { x, y };

    // Trazar un punto de crayón inicial donde tocó el niño
    this.drawCrayonPoint(x, y);
    audio.playBrush();
    this.checkTracingProgress(x, y);
  }

  handlePointerMove(x, y) {
    if (!this.isDrawing || !this.lastPoint) return;

    // Dibujar trazo de crayón suave en tiempo real
    this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, x, y);
    this.lastPoint = { x, y };
    this.checkTracingProgress(x, y);
  }

  handlePointerUp() {
    this.isDrawing = false;
    this.lastPoint = null;
  }

  drawCrayonPoint(x, y) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    ctx.save();
    ctx.fillStyle = this.activeCrayonColor;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCrayonSegment(fromX, fromY, toX, toY) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    ctx.save();
    ctx.strokeStyle = this.activeCrayonColor;
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // DETECCIÓN INTELIGENTE DE COBERTURA: ¡SE AUTO-RELLENA CON ESTRELLITAS!
  // ==========================================================================
  checkTracingProgress(x, y) {
    if (this.levelConfig.type === 'intro_hollow') {
      this.checkIntroHollowHit(x, y);
    } else if (this.levelConfig.type === 'grid_row' || this.levelConfig.type === 'grid_row_alternating') {
      this.checkGridRowHit(x, y);
    }
  }

  /**
   * Cobertura de la A/a grande hueca (Nivel 1)
   */
  checkIntroHollowHit(x, y) {
    const W = this.paintCanvas.width;
    const H = this.paintCanvas.height;

    const upperStrokes = this.pedagogicalData.uppercaseStrokes || [];
    const lowerStrokes = this.pedagogicalData.lowercaseStrokes || [];

    // Validar trazos mayúscula
    upperStrokes.forEach(stroke => {
      if (this.hollowStrokesCompleted.upper.has(stroke.id)) return;
      if (this.isStrokeCovered(stroke, x, y, W, H)) {
        this.hollowStrokesCompleted.upper.add(stroke.id);
        this.snapHollowStroke(stroke, true);
        this.emitStarBurst(x, y);
        audio.playStar();

        // Si se completó toda la mayúscula
        if (this.hollowStrokesCompleted.upper.size === upperStrokes.length) {
          if (this.arabot) {
            this.arabot.speak(`¡Genial! ¡Ahora traza la pequeña <strong>${this.pedagogicalData.lowercase}</strong>! ⭐`);
            this.arabot.bounceHead();
          }
        }
      }
    });

    // Validar trazos minúscula
    lowerStrokes.forEach(stroke => {
      if (this.hollowStrokesCompleted.lower.has(stroke.id)) return;
      if (this.isStrokeCovered(stroke, x, y, W, H)) {
        this.hollowStrokesCompleted.lower.add(stroke.id);
        this.snapHollowStroke(stroke, false);
        this.emitStarBurst(x, y);
        audio.playStar();

        // Si se completaron mayúscula y minúscula -> ¡Colorear árbol y ganar nivel!
        if (this.hollowStrokesCompleted.upper.size === upperStrokes.length &&
            this.hollowStrokesCompleted.lower.size === lowerStrokes.length) {
          this.onIntroLevelComplete();
        }
      }
    });
  }

  isStrokeCovered(stroke, px, py, W, H) {
    if (stroke.isDot) {
      const p = stroke.points[0];
      return Math.hypot(px - p.x * W, py - p.y * H) <= 45;
    }

    // Verificar si el dedo pasó cerca de los puntos clave del trazo
    const pts = stroke.points;
    if (!pts || pts.length < 2) return false;

    let hits = 0;
    pts.forEach(p => {
      const dist = Math.hypot(px - p.x * W, py - p.y * H);
      if (dist <= 48) hits++;
    });

    return (hits >= Math.max(1, Math.floor(pts.length * 0.6)));
  }

  /**
   * Auto-rellena el trazo con un bonito color sólido brillante (desaparece lo chuequito)
   */
  snapHollowStroke(stroke, isUpper) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    const W = this.paintCanvas.width;
    const H = this.paintCanvas.height;

    ctx.save();
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isUpper ? '#ff7043' : '#00bcd4';
    ctx.shadowColor = isUpper ? 'rgba(255, 112, 67, 0.7)' : 'rgba(0, 188, 212, 0.7)';
    ctx.shadowBlur = 12;

    if (stroke.isDot) {
      const p = stroke.points[0];
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, 16, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        const x = p.x * W;
        const y = p.y * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  onIntroLevelComplete() {
    this.isIllustrationColored = true;

    // 1. Sonido de celebración y confeti
    audio.playCelebration();
    Confetti.shoot(3000);

    // 2. Colorear mágicamente el Árbol (o elefante, isla, etc.)
    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) {
      treeZone.classList.add('colored');
    }
    const caption = document.getElementById('treeCaption');
    if (caption) {
      caption.innerHTML = `🎉 ¡${this.pedagogicalData.word} COLOREADO! ${this.pedagogicalData.icon}`;
      caption.classList.add('celebration-glow');
    }

    // 3. Arabot celebra
    if (this.arabot) {
      this.arabot.celebrate(`¡Excelente! ¡Completaste la ${this.pedagogicalData.letter} de ${this.pedagogicalData.word}! 🌳⭐`, 2800);
    }

    // 4. Guardar progreso
    const subgame = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];
    StorageManager.completeModuleLevel(subgame.moduleKey, this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    // 5. Transición automática suave al Nivel 2 (Renglón de cuadrícula)
    setTimeout(() => {
      this.showAutoTransitionBanner();
    }, 2200);
  }

  /**
   * Cobertura de letras en el renglón de cuadrícula (Niveles 2, 3, 4, 5...)
   */
  checkGridRowHit(x, y) {
    const W = this.paintCanvas.width;
    const topY = 115;
    const baseY = 315;
    const count = this.totalRowLetters;
    const stepX = W / count;

    for (let i = 0; i < count; i++) {
      if (this.rowLettersCompleted[i]) continue;

      const cx = (i + 0.5) * stepX;
      const minX = cx - (stepX * 0.44);
      const maxX = cx + (stepX * 0.44);

      // Si el niño trazó dentro de la caja de esta letra
      if (x >= minX && x <= maxX && y >= topY - 20 && y <= baseY + 30) {
        this.rowLettersCompleted[i] = true;

        // Auto-rellenar esa letra en color sólido
        this.snapGridRowLetter(i, cx);
        this.emitStarBurst(cx, (topY + baseY) / 2);
        audio.playPop();

        // Actualizar contador visual
        const completedCount = this.rowLettersCompleted.filter(Boolean).length;
        const label = document.getElementById('completedCountLabel');
        if (label) label.innerText = `${completedCount}`;

        // Si completó todas las letras del renglón
        if (completedCount === count) {
          this.onRowLevelComplete();
        }
      }
    }
  }

  snapGridRowLetter(index, cx) {
    if (!this.paintCtx) return;
    const ctx = this.paintCtx;
    const topY = 115;
    const midY = 215;
    const baseY = 315;

    let char = '';
    let isUpper = true;

    if (this.levelConfig.type === 'grid_row') {
      char = this.levelConfig.char;
      isUpper = (char === char.toUpperCase() && char !== char.toLowerCase());
    } else if (this.levelConfig.type === 'grid_row_alternating') {
      char = this.levelConfig.pattern[index];
      isUpper = (char === char.toUpperCase() && char !== char.toLowerCase());
    }

    ctx.save();
    ctx.strokeStyle = isUpper ? '#2e7d32' : '#00838f';
    ctx.lineWidth = isUpper ? 6.5 : 5.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = isUpper ? 'rgba(76, 175, 80, 0.7)' : 'rgba(0, 188, 212, 0.7)';
    ctx.shadowBlur = 8;

    const c = char.toUpperCase();

    if (isUpper) {
      if (c === 'A') {
        ctx.beginPath();
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx - 26, baseY);
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx + 26, baseY);
        ctx.moveTo(cx - 15, midY);
        ctx.lineTo(cx + 15, midY);
        ctx.stroke();
      } else if (c === 'E') {
        ctx.beginPath();
        ctx.moveTo(cx - 20, topY + 5);
        ctx.lineTo(cx - 20, baseY);
        ctx.moveTo(cx - 20, topY + 5);
        ctx.lineTo(cx + 20, topY + 5);
        ctx.moveTo(cx - 20, midY);
        ctx.lineTo(cx + 14, midY);
        ctx.moveTo(cx - 20, baseY);
        ctx.lineTo(cx + 20, baseY);
        ctx.stroke();
      } else if (c === 'I') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx + 18, topY + 5);
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx, baseY);
        ctx.moveTo(cx - 18, baseY);
        ctx.lineTo(cx + 18, baseY);
        ctx.stroke();
      } else if (c === 'O') {
        ctx.beginPath();
        ctx.ellipse(cx, midY, 26, 92, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c === 'U') {
        ctx.beginPath();
        ctx.moveTo(cx - 22, topY + 5);
        ctx.lineTo(cx - 22, baseY - 35);
        ctx.quadraticCurveTo(cx - 22, baseY, cx, baseY);
        ctx.quadraticCurveTo(cx + 22, baseY, cx + 22, baseY - 35);
        ctx.lineTo(cx + 22, topY + 5);
        ctx.stroke();
      } else if (c === 'M') {
        ctx.beginPath();
        ctx.moveTo(cx - 24, baseY);
        ctx.lineTo(cx - 24, topY + 5);
        ctx.lineTo(cx, midY + 15);
        ctx.lineTo(cx + 24, topY + 5);
        ctx.lineTo(cx + 24, baseY);
        ctx.stroke();
      } else if (c === 'S') {
        ctx.beginPath();
        ctx.moveTo(cx + 18, topY + 18);
        ctx.quadraticCurveTo(cx, topY, cx - 12, topY + 25);
        ctx.quadraticCurveTo(cx - 16, midY, cx, midY);
        ctx.quadraticCurveTo(cx + 18, midY, cx + 14, baseY - 20);
        ctx.quadraticCurveTo(cx, baseY + 4, cx - 18, baseY - 16);
        ctx.stroke();
      } else if (c === 'T') {
        ctx.beginPath();
        ctx.moveTo(cx - 22, topY + 5);
        ctx.lineTo(cx + 22, topY + 5);
        ctx.moveTo(cx, topY + 5);
        ctx.lineTo(cx, baseY);
        ctx.stroke();
      } else if (c === 'L') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx - 18, baseY);
        ctx.lineTo(cx + 20, baseY);
        ctx.stroke();
      } else if (c === 'P') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx - 18, baseY);
        ctx.moveTo(cx - 18, topY + 5);
        ctx.quadraticCurveTo(cx + 24, topY + 5, cx + 24, midY);
        ctx.quadraticCurveTo(cx + 24, midY + 15, cx - 18, midY + 15);
        ctx.stroke();
      } else if (c === 'N') {
        ctx.beginPath();
        ctx.moveTo(cx - 22, baseY);
        ctx.lineTo(cx - 22, topY + 5);
        ctx.lineTo(cx + 22, baseY);
        ctx.lineTo(cx + 22, topY + 5);
        ctx.stroke();
      } else if (c === 'R') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, topY + 5);
        ctx.lineTo(cx - 18, baseY);
        ctx.moveTo(cx - 18, topY + 5);
        ctx.quadraticCurveTo(cx + 22, topY + 5, cx + 22, midY);
        ctx.quadraticCurveTo(cx + 22, midY + 12, cx - 18, midY + 12);
        ctx.moveTo(cx - 2, midY + 12);
        ctx.lineTo(cx + 22, baseY);
        ctx.stroke();
      } else {
        ctx.font = 'bold 115px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.strokeText(char, cx, baseY - 8);
      }
    } else {
      if (c === 'A') {
        ctx.beginPath();
        ctx.arc(cx - 3, midY + 48, 20, 0, Math.PI * 2);
        ctx.moveTo(cx + 17, midY + 5);
        ctx.lineTo(cx + 17, baseY);
        ctx.stroke();
      } else if (c === 'E') {
        ctx.beginPath();
        ctx.moveTo(cx - 16, midY + 48);
        ctx.lineTo(cx + 16, midY + 48);
        ctx.arc(cx, midY + 48, 18, 0, Math.PI * 1.7, true);
        ctx.stroke();
      } else if (c === 'I') {
        ctx.beginPath();
        ctx.moveTo(cx, midY + 25);
        ctx.lineTo(cx, baseY);
        ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(cx, midY + 10, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (c === 'O') {
        ctx.beginPath();
        ctx.arc(cx, midY + 48, 20, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c === 'U') {
        ctx.beginPath();
        ctx.moveTo(cx - 15, midY + 10);
        ctx.lineTo(cx - 15, baseY - 20);
        ctx.quadraticCurveTo(cx - 15, baseY, cx, baseY);
        ctx.quadraticCurveTo(cx + 15, baseY, cx + 15, baseY - 20);
        ctx.lineTo(cx + 15, midY + 10);
        ctx.moveTo(cx + 15, midY + 10);
        ctx.lineTo(cx + 15, baseY);
        ctx.stroke();
      } else if (c === 'M') {
        ctx.beginPath();
        ctx.moveTo(cx - 20, midY + 10);
        ctx.lineTo(cx - 20, baseY);
        ctx.moveTo(cx - 20, midY + 25);
        ctx.quadraticCurveTo(cx - 10, midY + 10, cx, midY + 25);
        ctx.lineTo(cx, baseY);
        ctx.moveTo(cx, midY + 25);
        ctx.quadraticCurveTo(cx + 10, midY + 10, cx + 20, midY + 25);
        ctx.lineTo(cx + 20, baseY);
        ctx.stroke();
      } else if (c === 'S') {
        ctx.beginPath();
        ctx.moveTo(cx + 12, midY + 20);
        ctx.quadraticCurveTo(cx, midY + 10, cx - 8, midY + 24);
        ctx.quadraticCurveTo(cx - 10, midY + 45, cx, midY + 45);
        ctx.quadraticCurveTo(cx + 12, midY + 45, cx + 8, baseY - 10);
        ctx.quadraticCurveTo(cx, baseY + 4, cx - 12, baseY - 8);
        ctx.stroke();
      } else if (c === 'T') {
        ctx.beginPath();
        ctx.moveTo(cx, midY - 15);
        ctx.lineTo(cx, baseY - 10);
        ctx.quadraticCurveTo(cx, baseY, cx + 12, baseY);
        ctx.moveTo(cx - 12, midY + 15);
        ctx.lineTo(cx + 12, midY + 15);
        ctx.stroke();
      } else if (c === 'L') {
        ctx.beginPath();
        ctx.moveTo(cx, topY + 10);
        ctx.lineTo(cx, baseY);
        ctx.stroke();
      } else if (c === 'P') {
        ctx.beginPath();
        ctx.moveTo(cx - 14, midY + 10);
        ctx.lineTo(cx - 14, baseY + 45);
        ctx.arc(cx, midY + 45, 18, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c === 'N') {
        ctx.beginPath();
        ctx.moveTo(cx - 15, midY + 10);
        ctx.lineTo(cx - 15, baseY);
        ctx.moveTo(cx - 15, midY + 25);
        ctx.quadraticCurveTo(cx, midY + 10, cx + 15, midY + 25);
        ctx.lineTo(cx + 15, baseY);
        ctx.stroke();
      } else if (c === 'R') {
        ctx.beginPath();
        ctx.moveTo(cx - 12, midY + 10);
        ctx.lineTo(cx - 12, baseY);
        ctx.moveTo(cx - 12, midY + 25);
        ctx.quadraticCurveTo(cx, midY + 10, cx + 14, midY + 15);
        ctx.stroke();
      } else {
        ctx.font = 'bold 75px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.strokeText(char, cx, baseY - 6);
      }
    }
    ctx.restore();
  }

  onRowLevelComplete() {
    audio.playCelebration();
    Confetti.shoot(2800);

    if (this.arabot) {
      this.arabot.celebrate('¡Completaste todo el renglón caligráfico! ⭐⭐⭐', 2600);
    }

    const subgame = TRACING_SUBGAMES.find(g => g.id === this.activeSubgame) || TRACING_SUBGAMES[0];
    StorageManager.completeModuleLevel(subgame.moduleKey, this.currentLevel, 3);
    rewards.unlockReward('star_badge');

    setTimeout(() => {
      this.showAutoTransitionBanner();
    }, 1800);
  }

  showAutoTransitionBanner() {
    const banner = document.getElementById('autoTransitionBanner');
    const fill = document.getElementById('transitionProgressFill');

    if (!banner) {
      this.advanceToNextLevel();
      return;
    }

    banner.style.display = 'flex';
    if (fill) {
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = '100%'; }, 50);
    }

    setTimeout(() => {
      this.advanceToNextLevel();
    }, 1300);
  }

  advanceToNextLevel() {
    this.cleanup();
    const container = document.getElementById('app');
    if (!container) return;

    const levels = SUBGAMES_LEVEL_MAP[this.activeSubgame] || VOCALES_WORKBOOK_LEVELS;

    if (this.currentLevel < levels.length) {
      this.currentLevel++;
      this.renderLevelGame(container);
    } else {
      // Al terminar los niveles del cuadernillo, volver al selector
      this.currentLevel = null;
      this.render(container);
    }
  }

  // ==========================================================================
  // EFECTO MÁGICO DE ESTRELLITAS (SPARKLE BURST)
  // ==========================================================================
  emitStarBurst(x, y) {
    const colors = ['#ffd700', '#ffeb3b', '#ff9800', '#00e5ff', '#76ff03', '#ff4081'];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.035 + Math.random() * 0.02
      });
    }
  }

  startFxLoop() {
    const loop = () => {
      this.renderFxFrame();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  renderFxFrame() {
    if (!this.fxCtx || !this.fxCanvas) return;
    const ctx = this.fxCtx;
    ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // Gravedad suave
      p.life -= p.decay;

      if (p.life <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      // Dibujar estrellita de 4 puntas
      const s = p.size;
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s * 0.35, p.y - s * 0.35);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x, p.y + s);
      ctx.lineTo(p.x - s * 0.35, p.y + s * 0.35);
      ctx.lineTo(p.x - s, p.y);
      ctx.lineTo(p.x - s * 0.35, p.y - s * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  clearPaintCanvas() {
    if (this.paintCtx && this.paintCanvas) {
      this.paintCtx.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
    }
    this.hollowStrokesCompleted = { upper: new Set(), lower: new Set() };
    if (this.rowLettersCompleted) {
      this.rowLettersCompleted.fill(false);
    }
    const label = document.getElementById('completedCountLabel');
    if (label) label.innerText = '0';

    const treeZone = document.getElementById('notebookTreeZone');
    if (treeZone) {
      treeZone.classList.remove('colored');
    }
    const treeCaption = document.getElementById('treeCaption');
    if (treeCaption && this.pedagogicalData) {
      treeCaption.innerHTML = `${this.pedagogicalData.phonetic} ${this.pedagogicalData.icon}`;
      treeCaption.classList.remove('celebration-glow');
    }
  }

  // ==========================================================================
  // VISTA 4: PIZARRA MÁGICA ESCOLAR (DIBUJO LIBRE)
  // ==========================================================================
  renderPizarraMagica(container) {
    this.cleanup();

    container.innerHTML = `
      <div class="tracing-module notebook-grid-bg fade-in" id="pizarraModule">
        <header class="tracing-header pizarra-header">
          <button class="back-btn" id="btnBackFromPizarra">⬅️ Menú</button>
          
          <div class="crayons-palette">
            <button class="crayon-pill active" data-color="#ff5722" style="background:#ff5722;">🖍️</button>
            <button class="crayon-pill" data-color="#e91e63" style="background:#e91e63;">🖍️</button>
            <button class="crayon-pill" data-color="#ff9800" style="background:#ff9800;">🖍️</button>
            <button class="crayon-pill" data-color="#4caf50" style="background:#4caf50;">🖍️</button>
            <button class="crayon-pill" data-color="#00bcd4" style="background:#00bcd4;">🖍️</button>
            <button class="crayon-pill" data-color="#9c27b0" style="background:#9c27b0;">🖍️</button>
          </div>

          <button class="clear-btn" id="btnClearPizarra">🧹 Limpiar</button>
        </header>

        <main class="notebook-workspace">
          <div class="notebook-page-header">
            <h2>PIZARRA MÁGICA ESCOLAR</h2>
            <p class="notebook-instruction">🎨 Dibuja, escribe y raya libremente sobre la cuadrícula del cuaderno con tus crayones.</p>
          </div>

          <div class="notebook-grid-container" id="pizarraGridContainer">
            <canvas id="bgCanvas" width="760" height="420"></canvas>
            <canvas id="paintCanvas" width="760" height="420"></canvas>
            <canvas id="fxCanvas" width="760" height="420"></canvas>
          </div>
        </main>
      </div>
    `;

    this.setupCanvases(container);
    this.drawPizarraBackground();
    this.startFxLoop();

    // Eventos de selección de crayones
    container.querySelectorAll('.crayon-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audio.playClick();
        container.querySelectorAll('.crayon-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCrayonColor = btn.dataset.color || '#ff5722';
      });
    });

    container.querySelector('#btnBackFromPizarra')?.addEventListener('click', () => {
      audio.playClick();
      this.activeSubgame = null;
      this.currentLevel = null;
      this.render(container);
    });

    container.querySelector('#btnClearPizarra')?.addEventListener('click', () => {
      audio.playClick();
      this.clearPaintCanvas();
    });

    const canvas = this.paintCanvas;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      this.isDrawing = true;
      const pt = this.getCanvasPoint(e);
      this.lastPoint = pt;
      this.drawCrayonPoint(pt.x, pt.y);
      audio.playBrush();
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (!this.isDrawing || !this.lastPoint) return;
      const pt = this.getCanvasPoint(e);
      this.drawCrayonSegment(this.lastPoint.x, this.lastPoint.y, pt.x, pt.y);
      this.lastPoint = pt;
    }, { passive: false });

    const stopDraw = () => {
      this.isDrawing = false;
      this.lastPoint = null;
    };
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);
  }

  drawPizarraBackground() {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const W = this.bgCanvas.width;
    const H = this.bgCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // Cuadrícula azul escolar completa
    const gridSize = 38;
    ctx.strokeStyle = 'rgba(41, 182, 246, 0.25)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.paintCanvas && this.boundPointerUp) {
      this.paintCanvas.removeEventListener('pointermove', this.boundPointerMove);
      this.paintCanvas.removeEventListener('pointerup', this.boundPointerUp);
      this.paintCanvas.removeEventListener('pointercancel', this.boundPointerUp);
      this.boundPointerUp = null;
      this.boundPointerMove = null;
    }
    if (this.arabot) {
      this.arabot.destroy();
      this.arabot = null;
    }
    this.sparkles = [];
  }
}
