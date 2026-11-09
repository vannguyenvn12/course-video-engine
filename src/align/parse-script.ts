export type ScriptParseResult = {
  spokenText: string;
  words: string[];
  sentences: {id: string; text: string; wordStart: number; wordEnd: number}[];
};

const sentenceSplit = /(?<=[.!?])\s+(?=[A-Za-z0-9"'])/;

export const parseScriptMarkdown = (markdown: string): ScriptParseResult => {
  const lines = markdown.split(/\r?\n/);
  const spokenLines: string[] = [];
  let inCode = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      continue;
    }
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    spokenLines.push(trimmed);
  }

  const spokenText = spokenLines.join(' ');
  const sentenceTexts = spokenText.split(sentenceSplit).filter(Boolean);
  const words: string[] = [];
  const sentences: ScriptParseResult['sentences'] = [];

  for (let s = 0; s < sentenceTexts.length; s++) {
    const text = sentenceTexts[s]!.trim();
    const tokens = text.match(/[\w']+(?:'[a-z]+)?/gi) ?? [];
    if (tokens.length === 0) {
      continue;
    }
    const wordStart = words.length;
    words.push(...tokens);
    sentences.push({
      id: `sent-${String(s + 1).padStart(2, '0')}`,
      text,
      wordStart,
      wordEnd: words.length,
    });
  }

  return {spokenText, words, sentences};
};
