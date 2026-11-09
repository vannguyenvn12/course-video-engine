import {Composition} from 'remotion';
import {canvas} from '../design/tokens';
import {FontStill} from './FontStill';
import {SampleCode} from './design-samples/SampleCode';
import {SampleOpener} from './design-samples/SampleOpener';
import {SampleTable} from './design-samples/SampleTable';
import {MeasurePreset} from './MeasurePreset';
import {LectureVideo, type LectureVideoProps} from './LectureVideo';

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
      <Composition
        id="MeasurePreset"
        component={MeasurePreset}
        durationInFrames={1}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{preset: 'opener', slots: {title: 'Measure', kicker: 'k'}}}
      />
      <Composition
        id="Lecture"
        component={LectureVideo}
        durationInFrames={canvas.fps * 30}
        fps={canvas.fps}
        width={canvas.width}
        height={canvas.height}
        defaultProps={{
          audioFile: 'silence.mp3',
          scenes: [],
        } satisfies LectureVideoProps}
      />
    </>
  );
};
