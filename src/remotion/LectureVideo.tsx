import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {useEffect} from 'react';
import {loadCourseFonts} from '../design/load-fonts';
import {PresetStage} from '../presets/PresetStage';

export type LectureSceneProps = {
  id: string;
  preset: string;
  slots: Record<string, unknown>;
  startFrame: number;
  durationFrames: number;
};

export type LectureVideoProps = {
  audioFile: string;
  scenes: LectureSceneProps[];
};

export const LectureVideo: React.FC<LectureVideoProps> = ({audioFile, scenes}) => {
  useEffect(() => {
    void loadCourseFonts();
  }, []);

  return (
    <AbsoluteFill>
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
          name={scene.id}
        >
          <PresetStage preset={scene.preset} slots={scene.slots} />
        </Sequence>
      ))}
      {audioFile !== 'silence.mp3' ? <Audio src={staticFile(audioFile)} /> : null}
    </AbsoluteFill>
  );
};
