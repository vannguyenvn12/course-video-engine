import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {useEffect} from 'react';
import {loadCourseFonts} from '../design/load-fonts';
import {getCodeHighlighter} from '../design/highlight-code';
import {PersistTableEcho} from '../motion/persist-echo';
import type {PersistTableCarry} from '../dsl/persist-carry';
import type {CompiledBeat} from '../compile/compile';
import {SceneStage} from '../presets/SceneStage';
import {
  MORPH_FRAMES,
  SceneTransitionShell,
  useSceneEnterStyle,
  useSceneExitStyle,
} from '../motion/scene-transition';

export type LectureSceneProps = {
  id: string;
  preset: string;
  slots: Record<string, unknown>;
  startFrame: number;
  durationFrames: number;
  beats: CompiledBeat[];
  transition?: 'morph' | 'camera' | 'cut' | 'fade';
  nextTransition?: 'morph' | 'camera' | 'cut' | 'fade';
  persistEcho?: PersistTableCarry | null;
};

export type LectureVideoProps = {
  audioFile: string;
  scenes: LectureSceneProps[];
};

const morphEnter = (t?: LectureSceneProps['transition']): number =>
  t === 'morph' || t === 'camera' ? MORPH_FRAMES : t === 'fade' ? 15 : 0;

const SceneClip: React.FC<LectureSceneProps & {sequenceDuration: number}> = (scene) => {
  const frame = useCurrentFrame();
  const enterStyle = useSceneEnterStyle(scene.transition);
  const exitStyle = useSceneExitStyle(
    Boolean(scene.nextTransition && scene.nextTransition !== 'cut'),
    scene.nextTransition,
    frame,
    scene.sequenceDuration,
  );

  const showPersist =
    scene.persistEcho &&
    (scene.transition === 'morph' || scene.transition === 'camera') &&
    frame < MORPH_FRAMES;

  return (
    <SceneTransitionShell enterStyle={enterStyle} exitStyle={exitStyle}>
      {showPersist ? <PersistTableEcho table={scene.persistEcho!} morphPhase="enter" /> : null}
      <SceneStage
        preset={scene.preset}
        slots={scene.slots}
        localFrame={frame}
        beats={scene.beats}
      />
    </SceneTransitionShell>
  );
};

export const LectureVideo: React.FC<LectureVideoProps> = ({audioFile, scenes}) => {
  useEffect(() => {
    void loadCourseFonts();
    void getCodeHighlighter();
  }, []);

  const placements = scenes.map((scene, i) => {
    const enterPad = morphEnter(scene.transition);
    const exitPad = i < scenes.length - 1 ? morphEnter(scenes[i + 1]!.transition) : 0;
    const from = scene.startFrame - enterPad;
    const duration = scene.durationFrames + enterPad + exitPad;
    return {...scene, from, duration, nextTransition: scenes[i + 1]?.transition};
  });

  return (
    <AbsoluteFill>
      {placements.map((scene) => (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration} name={scene.id}>
          <SceneClip {...scene} sequenceDuration={scene.duration} />
        </Sequence>
      ))}
      {audioFile !== 'silence.mp3' ? <Audio src={staticFile(audioFile)} /> : null}
    </AbsoluteFill>
  );
};
