import {useEffect} from 'react';
import {colors, canvas, layout} from './tokens';
import {loadCourseFonts} from './load-fonts';
import {StageBackdrop} from './stage-backdrop';

type SampleShellProps = {
  children: React.ReactNode;
  motionFrame?: number;
};

export const SampleShell: React.FC<SampleShellProps> = ({children, motionFrame = 0}) => {
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
      <StageBackdrop motionFrame={motionFrame} />
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
