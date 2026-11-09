import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {CompiledBeat} from '../compile/compile.js';
import {motionStateAtFrame} from '../motion/beat-state.js';
import {CameraRig} from '../motion/camera-rig.js';
import {ConnectorOverlay} from '../motion/connector-overlay.js';
import {PresetStage} from './PresetStage.js';

export type SceneStageProps = {
  preset: string;
  slots: Record<string, unknown>;
  localFrame: number;
  beats: CompiledBeat[];
};

const motionHints = (preset: string, slots: Record<string, unknown>) => {
  if (preset === 'hero-table-with-annotation') {
    const table = slots.table as {rows?: string[][]} | undefined;
    const ann = slots.annotation as {to?: number} | undefined;
    return {
      tableRowCount: table?.rows?.length ?? 0,
      counterTo: ann?.to,
    };
  }
  return {};
};

export const SceneStage: React.FC<SceneStageProps> = ({preset, slots, localFrame, beats}) => {
  const frame = useCurrentFrame();
  const motion = useMemo(
    () => motionStateAtFrame(beats, frame, motionHints(preset, slots)),
    [beats, frame, preset, slots],
  );

  return (
    <AbsoluteFill>
      <CameraRig beats={beats}>
        <PresetStage
          preset={preset}
          slots={slots}
          motion={motion}
          localFrame={frame}
          beats={beats}
        />
      </CameraRig>
      <ConnectorOverlay beats={beats} />
    </AbsoluteFill>
  );
};
