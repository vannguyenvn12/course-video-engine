import {PresetStage, type PresetStageProps} from '../presets/PresetStage';
import {useEffect} from 'react';
import {loadCourseFonts} from '../design/load-fonts';

export const MeasurePreset: React.FC<PresetStageProps> = (props) => {
  useEffect(() => {
    void loadCourseFonts();
  }, []);
  return <PresetStage preset={props.preset} slots={props.slots} />;
};
