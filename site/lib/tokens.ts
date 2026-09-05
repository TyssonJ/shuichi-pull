export const cores = {
  bg: '#0E0E11',
  sur: '#17171D',
  line: '#2A2A33',
  papel: '#E8E2D2',
  tinta: '#14141A',
  teal: '#63C4BC',
  tealEscuro: '#1E6E73',
  red: '#D9534A',
  dim: '#7A7A88',
  egoVerdeClaro: '#4FA030',
  egoVerdeEscuro: '#256512',
} as const;

export type Cor = keyof typeof cores;
