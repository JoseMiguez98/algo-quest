import type { AlgorithmContent } from '../../../core/algorithm';

const content: AlgorithmContent = {
  name: 'Backtracking en laberinto',
  tagline: 'Avanza hasta chocar, retrocede y prueba otro camino',
  summary:
    'Este resolvedor recursivo de laberintos avanza desde la entrada probando, en orden, derecha, abajo, izquierda y arriba. Cada celda que pisa entra al camino actual; si desde ahí ninguna dirección lleva a la salida, la saca del camino y vuelve atrás (backtracking). Encuentra una salida si existe, pero no necesariamente la más corta.',
  steps: [
    'Desde la celda actual, rechazá si está fuera del tablero, es pared o ya fue visitada.',
    'Marcala como visitada y agregala al camino; si es la salida, terminaste.',
    'Probá recursivamente las vecinas en orden: derecha, abajo, izquierda, arriba.',
    'Si ninguna funciona, sacá la celda del camino y volvé a la anterior.',
    'Con “memoria” las celdas fallidas quedan marcadas; en modo “puro” solo se evitan las del camino actual.',
  ],
  whenToUse:
    'Para entender recursión y vuelta atrás, resolver laberintos chicos o problemas de búsqueda con restricciones (sudoku, N reinas). Si necesitás el camino más corto, usá BFS.',
  references: [
    { title: 'Vuelta atrás — Wikipedia (español)', url: 'https://es.wikipedia.org/wiki/Vuelta_atr%C3%A1s' },
    { title: 'Maze-solving algorithm — Wikipedia (inglés)', url: 'https://en.wikipedia.org/wiki/Maze-solving_algorithm' },
    { title: 'Rat in a Maze — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/dsa/rat-in-a-maze/' },
  ],
  narration: {
    start: 'Buscamos un camino de {s} a {t} probando direcciones y retrocediendo al trabarnos.',
    visit: 'Pisamos {cell} (profundidad {depth}): entra al camino actual.',
    'reject-path': '{cell} ya está en el camino actual: volver ahí sería dar vueltas en círculo.',
    'reject-visited': '{cell} ya fue explorada y no llevó a la salida: no la repetimos.',
    'reject-bounds': 'Por ese lado nos salimos del tablero: probamos la siguiente dirección.',
    'reject-wall': 'Por ese lado hay una pared: probamos la siguiente dirección.',
    try: 'Probamos avanzar a {next} y seguimos buscando desde ahí.',
    backtrack: 'Desde {cell} no hay salida por ningún lado: la sacamos del camino y volvemos atrás.',
    found: '¡Llegamos a la salida! El camino tiene {len} pasos.',
    'done-found': 'Camino encontrado: {len} pasos, aunque no necesariamente el más corto.',
    'done-unreachable': 'Probamos todas las opciones desde la entrada: no hay camino a la salida.',
  },
  legend: { frontier: 'En el camino actual', current: 'Celda actual', dead: 'Callejón sin salida' },
  options: {
    visited: 'Celdas visitadas',
    'visited.memo': 'Con memoria',
    'visited.pure': 'Puro (solo el camino actual)',
  },
};

export default content;
