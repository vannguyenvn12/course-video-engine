import {colors} from './tokens';

const KEYWORDS = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'EXPLAIN',
  'INSERT',
  'UPDATE',
  'DELETE',
  'AND',
  'OR',
  'JOIN',
  'ON',
]);

/** Shiki-free SQL coloring aligned with DESIGN.md (no red syntax). */
export const SqlLine: React.FC<{text: string}> = ({text}) => {
  const parts = text.split(/(\s+|'[^']*'|\*|;)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        let color: string = colors.ink;
        if (KEYWORDS.has(part.toUpperCase())) {
          color = colors.ash;
        } else if (part.startsWith("'")) {
          color = '#9ec9cf';
        } else if (part === '*') {
          color = colors.ink;
        }
        return (
          <span key={i} style={{color}}>
            {part}
          </span>
        );
      })}
    </>
  );
};
