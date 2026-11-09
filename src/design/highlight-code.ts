import {createHighlighter, type Highlighter, type ThemedToken} from 'shiki';
import rawTheme from './shiki-theme.json';

const courseTheme = {...rawTheme, name: 'course-vault'} as import('shiki').ThemeRegistration;

let highlighterPromise: Promise<Highlighter> | null = null;

export const getCodeHighlighter = (): Promise<Highlighter> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [courseTheme],
      langs: ['sql'],
    });
  }
  return highlighterPromise;
};

export const highlightSqlLineSync = (line: string, h: Highlighter): ThemedToken[] => {
  const result = h.codeToTokens(line, {lang: 'sql', theme: 'course-vault'});
  return result.tokens[0] ?? [];
};
