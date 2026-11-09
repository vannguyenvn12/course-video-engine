import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const MORPH_FRAMES = 27;

export const useSceneEnterStyle = (
  transition: 'morph' | 'camera' | 'cut' | 'fade' | undefined,
): React.CSSProperties => {
  const frame = useCurrentFrame();

  if (!transition || transition === 'cut') {
    return {};
  }

  if (transition === 'fade') {
    const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
    return {opacity};
  }

  if (transition === 'morph' || transition === 'camera') {
    const t = interpolate(frame, [0, MORPH_FRAMES], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return {
      opacity: interpolate(t, [0, 1], [0.15, 1]),
      transform: `scale(${interpolate(t, [0, 1], [1.045, 1])})`,
      filter: `blur(${interpolate(t, [0, 1], [10, 0])}px)`,
    };
  }

  return {};
};

export const useSceneExitStyle = (
  isLastInOverlap: boolean,
  transitionIn: 'morph' | 'camera' | 'cut' | 'fade' | undefined,
  localFrame: number,
  sceneDuration: number,
): React.CSSProperties => {
  if (!isLastInOverlap || !transitionIn || transitionIn === 'cut') {
    return {};
  }
  const overlapStart = sceneDuration - MORPH_FRAMES;
  if (localFrame < overlapStart) {
    return {};
  }
  const t = interpolate(localFrame, [overlapStart, sceneDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {
    opacity: interpolate(t, [0, 1], [1, 0]),
    transform: `scale(${interpolate(t, [0, 1], [1, 0.96])})`,
    filter: `blur(${interpolate(t, [0, 1], [0, 12])}px)`,
  };
};

export const SceneTransitionShell: React.FC<{
  enterStyle: React.CSSProperties;
  exitStyle: React.CSSProperties;
  children: React.ReactNode;
}> = ({enterStyle, exitStyle, children}) => {
  const merged: React.CSSProperties = {
    ...enterStyle,
    ...(exitStyle.opacity !== undefined
      ? {
          opacity:
            typeof enterStyle.opacity === 'number' && typeof exitStyle.opacity === 'number'
              ? Math.min(enterStyle.opacity as number, exitStyle.opacity as number)
              : exitStyle.opacity ?? enterStyle.opacity,
        }
      : {}),
    transform: [enterStyle.transform, exitStyle.transform].filter(Boolean).join(' ') || undefined,
    filter: exitStyle.filter ?? enterStyle.filter,
  };

  return <AbsoluteFill style={merged}>{children}</AbsoluteFill>;
};
