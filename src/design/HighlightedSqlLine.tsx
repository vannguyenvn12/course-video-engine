import {useEffect, useState} from 'react';
import type {ThemedToken} from 'shiki';
import {colors, typography} from './tokens';
import {getCodeHighlighter, highlightSqlLineSync} from './highlight-code';
import {SqlLine} from './sql-syntax';

export const HighlightedSqlLine: React.FC<{text: string; fallback?: boolean}> = ({text, fallback}) => {
  const [tokens, setTokens] = useState<ThemedToken[] | null>(null);

  useEffect(() => {
    if (fallback) {
      return;
    }
    let cancelled = false;
    void getCodeHighlighter().then((h) => {
      if (!cancelled) {
        setTokens(highlightSqlLineSync(text, h));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [text, fallback]);

  if (fallback || !tokens?.length) {
    return <SqlLine text={text} />;
  }

  return (
    <span style={{fontFamily: typography.fontMono, fontSize: typography.sizes.code}}>
      {tokens.map((t, i) => (
        <span key={i} style={{color: t.color ?? colors.ink}}>
          {t.content}
        </span>
      ))}
    </span>
  );
};
