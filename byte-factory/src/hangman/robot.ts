/**
 * A small pixel-art robot, drawn as SVG from a character grid so it stays sharp at any size.
 * Colours live in hangman.css (classes px-<char>), so the eyes can change with the game state.
 *
 *   o outline   g body light   G body shade   v visor   e eyes
 *   b blue      W panel light
 */
export const ROBOT_ROWS: string[] = [
  '.......bb.......',
  '.......oo.......',
  '.oooooooooooooo.',
  '.ogggggggggggGo.',
  '.ogvvvvvvvvvvGo.',
  '.ogvveevveevvGo.',
  '.ogvveevveevvGo.',
  '.ogvvvvvvvvvvGo.',
  '.ogggggggggggGo.',
  '.oooooooooooooo.',
  '......oGGo......',
  '..oooooooooooo..',
  'og' + 'o' + 'gggggggggG' + 'o' + 'go',
  'og' + 'o' + 'ggbbbbbbgG' + 'o' + 'go',
  'og' + 'o' + 'ggbWWWWbgG' + 'o' + 'go',
  'og' + 'o' + 'ggbbWWbbgG' + 'o' + 'go',
  'og' + 'o' + 'gggggggggG' + 'o' + 'go',
  'oo' + 'oooooooooooo' + 'oo',
  '...oggo..oggo...',
  '...oooo..oooo...',
];

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Builds the robot as an <svg> element. Same-coloured neighbours are merged into one rect. */
export function createRobotSvg(): SVGSVGElement {
  const width = ROBOT_ROWS[0].length;
  const height = ROBOT_ROWS.length;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'hm-robot-svg');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');

  ROBOT_ROWS.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const char = row[x];
      let end = x;
      while (end + 1 < row.length && row[end + 1] === char) end += 1;
      if (char !== '.') {
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', String(x));
        rect.setAttribute('y', String(y));
        rect.setAttribute('width', String(end - x + 1));
        rect.setAttribute('height', '1');
        rect.setAttribute('class', `px-${char}`);
        svg.appendChild(rect);
      }
      x = end + 1;
    }
  });
  return svg;
}
