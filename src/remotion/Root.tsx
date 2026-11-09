import {Composition} from 'remotion';
import {canvas} from '../design/tokens';
import {FontStill} from './FontStill';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FontStill"
        component={FontStill}
        durationInFrames={1}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{}}
      />
    </>
  );
};
