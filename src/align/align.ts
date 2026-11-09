import {normalizeToken} from './normalize.js';
import {TimelineSchema, type Timeline, type WhisperWord, type WordTiming} from './types.js';
import type {ScriptParseResult} from './parse-script.js';

const occurrenceKey = (normalized: string, occurrence: number) => `${normalized}#${occurrence}`;

const assignOccurrences = (words: string[]): {text: string; normalized: string; occurrence: number}[] => {
  const counts = new Map<string, number>();
  return words.map((text) => {
    const normalized = normalizeToken(text);
    const next = (counts.get(normalized) ?? 0) + 1;
    counts.set(normalized, next);
    return {text, normalized, occurrence: next};
  });
};

/** Greedy align: script tokens are canonical; whisper supplies timestamps in order. */
export const alignScriptToWhisper = (
  script: ScriptParseResult,
  whisperWords: WhisperWord[],
  lecture: string,
  audioDurationMs: number,
): Timeline => {
  const scriptTokens = assignOccurrences(script.words);
  const whisperQueue = whisperWords.map((w) => ({
    ...w,
    normalized: normalizeToken(w.word),
  }));

  let wi = 0;
  const aligned: WordTiming[] = [];

  for (let i = 0; i < scriptTokens.length; i++) {
    const token = scriptTokens[i]!;
    while (wi < whisperQueue.length && whisperQueue[wi]!.normalized !== token.normalized) {
      wi++;
    }
    if (wi >= whisperQueue.length) {
      throw new Error(
        `Align failed: no whisper match for script word "${token.text}" (${token.normalized} #${token.occurrence}) at index ${i}`,
      );
    }
    const match = whisperQueue[wi]!;
    wi++;
    aligned.push({
      index: i,
      text: token.text,
      normalized: token.normalized,
      occurrence: token.occurrence,
      startMs: Math.round(match.start * 1000),
      endMs: Math.round(match.end * 1000),
    });
  }

  const sentences = script.sentences.map((s) => {
    const first = aligned[s.wordStart];
    const last = aligned[s.wordEnd - 1];
    if (!first || !last) {
      throw new Error(`Sentence ${s.id} has no aligned words`);
    }
    return {
      id: s.id,
      text: s.text,
      startMs: first.startMs,
      endMs: last.endMs,
      wordIndexes: Array.from({length: s.wordEnd - s.wordStart}, (_, k) => s.wordStart + k),
    };
  });

  return TimelineSchema.parse({
    lecture,
    audioDurationMs,
    words: aligned,
    sentences,
  });
};
