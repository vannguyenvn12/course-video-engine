import {interpolate, useCurrentFrame} from 'remotion';
import type {CompiledBeat} from '../compile/compile.js';
import type {CameraState} from '../layout/camera.js';

const cameraAtBeat = (beats: CompiledBeat[], localFrame: number): CameraState => {
  let state: CameraState = {scale: 1, offsetX: 0, offsetY: 0};
  let prevFrame = 0;
  let prevState = state;

  for (const beat of beats) {
    if (beat.frame > localFrame) {
      const span = Math.max(1, beat.frame - prevFrame);
      const t = interpolate(localFrame, [prevFrame, beat.frame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return {
        scale: interpolate(t, [0, 1], [prevState.scale, state.scale]),
        offsetX: interpolate(t, [0, 1], [prevState.offsetX, state.offsetX]),
        offsetY: interpolate(t, [0, 1], [prevState.offsetY, state.offsetY]),
      };
    }
    prevFrame = beat.frame;
    prevState = state;
    if (beat.camera) {
      state = beat.camera;
    }
  }

  const breathe = 1 + 0.008 * Math.sin(localFrame / 45);
  const ken = interpolate(localFrame, [0, 900], [0, 1.015], {extrapolateRight: 'clamp'});

  return {
    scale: state.scale * ken * breathe,
    offsetX: state.offsetX,
    offsetY: state.offsetY,
  };
};

export const CameraRig: React.FC<{beats: CompiledBeat[]; children: React.ReactNode}> = ({
  beats,
  children,
}) => {
  const frame = useCurrentFrame();
  const cam = cameraAtBeat(beats, frame);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `translate(${cam.offsetX}px, ${cam.offsetY}px) scale(${cam.scale})`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};
