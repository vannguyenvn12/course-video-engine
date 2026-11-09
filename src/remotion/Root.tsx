import {Composition} from 'remotion';
import {canvas} from '../design/tokens';
import {FontStill} from './FontStill';
import {SampleCode} from './design-samples/SampleCode';
import {SampleOpener} from './design-samples/SampleOpener';
import {SampleTable} from './design-samples/SampleTable';

const stillComposition = (id: string, component: React.FC) => (
  <Composition
    key={id}
    id={id}
    component={component}
    durationInFrames={1}
    fps={canvas.fps}
    width={canvas.width}
    height={canvas.height}
    defaultProps={{}}
  />
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {stillComposition('FontStill', FontStill)}
      {stillComposition('SampleOpener', SampleOpener)}
      {stillComposition('SampleTable', SampleTable)}
      {stillComposition('SampleCode', SampleCode)}
    </>
  );
};
