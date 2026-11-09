import {runAlign} from '../src/align/run-align.js';
import {runSegment} from '../src/segment/run-segment.js';

const usage = () => {
  console.error(
    JSON.stringify({
      ok: false,
      error: 'Usage: pnpm lecture <lectureDir> align|segment',
    }),
  );
  process.exit(1);
};

const main = () => {
  const lectureDir = process.argv[2];
  const command = process.argv[3];
  if (!lectureDir || !command) {
    usage();
    return;
  }
  const dir = lectureDir;
  const cmd = command;

  try {
    if (cmd === 'align') {
      const {timelinePath, timeline} = runAlign(dir);
      console.log(JSON.stringify({ok: true, command: cmd, timelinePath, wordCount: timeline.words.length}));
      return;
    }
    if (cmd === 'segment') {
      const {segmentsPath, segments} = runSegment(dir);
      console.log(
        JSON.stringify({ok: true, command: cmd, segmentsPath, segmentCount: segments.segments.length}),
      );
      return;
    }
    console.error(JSON.stringify({ok: false, error: `Unknown command: ${command}`}));
    process.exit(1);
  } catch (err) {
    console.error(JSON.stringify({ok: false, error: String(err)}));
    process.exit(1);
  }
};

main();
