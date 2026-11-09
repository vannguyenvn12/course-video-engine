import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {alignScriptToWhisper} from '../src/align/align.js';
import {parseScriptMarkdown} from '../src/align/parse-script.js';
import {runAlign} from '../src/align/run-align.js';
import {runSegment} from '../src/segment/run-segment.js';
import {TimelineSchema} from '../src/align/types.js';
import {WhisperPayloadSchema} from '../src/align/types.js';

const fixtureDir = join(process.cwd(), 'lectures', 'postgres', 'fixture-seq-scan');

describe('Phase 1 — align + segment', () => {
  it('excludes fenced code from spoken words', () => {
    const md = readFileSync(join(fixtureDir, 'script.md'), 'utf8');
    const parsed = parseScriptMarkdown(md);
    const joined = parsed.words.join(' ').toLowerCase();
    expect(joined).not.toContain('explain');
    expect(joined).not.toContain('select');
    expect(joined).not.toContain('orders');
    expect(parsed.words.length).toBeGreaterThan(10);
  });

  it('aligns script words to whisper with occurrence for repeated "every"', () => {
    const md = readFileSync(join(fixtureDir, 'script.md'), 'utf8');
    const parsed = parseScriptMarkdown(md);
    const whisper = WhisperPayloadSchema.parse(
      JSON.parse(readFileSync(join(fixtureDir, 'whisper.fixture.json'), 'utf8')),
    );
    const timeline = alignScriptToWhisper(parsed, whisper.words, 'fixture-seq-scan', 24_500);
    const every = timeline.words.filter((w) => w.normalized === 'every');
    expect(every).toHaveLength(4);
    expect(every.map((w) => w.occurrence)).toEqual([1, 2, 3, 4]);
    expect(every[0]!.text).toBe('every');
    expect(timeline.words.map((w) => w.text).join(' ')).toBe(parsed.words.join(' '));
  });

  it('CLI pipeline writes timeline.json and segments.json in range', () => {
    const {timeline} = runAlign(fixtureDir);
    TimelineSchema.parse(timeline);
    const {segments} = runSegment(fixtureDir);
    expect(segments.segments.length).toBeGreaterThanOrEqual(1);
    for (const seg of segments.segments) {
      expect(seg.durationMs).toBeGreaterThanOrEqual(4_000);
      expect(seg.durationMs).toBeLessThanOrEqual(20_000);
    }
    const last = segments.segments.at(-1)!;
    expect(last.endMs).toBeLessThanOrEqual(timeline.audioDurationMs);
  });
});
