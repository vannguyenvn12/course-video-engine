import {AbsoluteFill} from 'remotion';
import {useEffect} from 'react';
import {colors, layout} from './tokens';
import {loadCourseFonts} from './load-fonts';
import {StageAmbient} from './stage-ambient';

type SampleShellProps = {
  children: React.ReactNode;
};

export const SampleShell: React.FC<SampleShellProps> = ({children}) => {
  useEffect(() => {
    void loadCourseFonts();
  }, []);

  return (
    <AbsoluteFill style={{backgroundColor: colors.vault}}>
      <StageAmbient />
      <div
        data-id="stage-safe"
        style={{
          position: 'absolute',
          left: layout.safeArea,
          top: layout.safeArea,
          right: layout.safeArea,
          bottom: layout.safeArea,
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: layout.gutter,
          alignContent: 'center',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
