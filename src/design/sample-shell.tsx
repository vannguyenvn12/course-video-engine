import {useEffect} from 'react';
import {colors, canvas, layout} from './tokens';
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
    <div
      style={{
        position: 'relative',
        width: canvas.width,
        height: canvas.height,
        backgroundColor: colors.vault,
        overflow: 'hidden',
      }}
    >
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
    </div>
  );
};
