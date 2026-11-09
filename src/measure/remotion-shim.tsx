/** Minimal stubs so preset views bundling for DOM measure does not pull full Remotion. */
import type {CSSProperties, ReactNode} from 'react';

export const AbsoluteFill = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) => (
  <div style={{position: 'absolute', inset: 0, ...style}}>{children}</div>
);

export const staticFile = (path: string): string => `/${path.replace(/^\//, '')}`;

export const delayRender = (): number => 0;
export const continueRender = (): void => undefined;

export const Audio = (): null => null;
export const Sequence = ({children}: {children?: ReactNode}) => <>{children}</>;
export const useCurrentFrame = (): number => 0;
export const useVideoConfig = (): {fps: number} => ({fps: 30});

export const interpolate = (
  input: number,
  inputRange: number[],
  outputRange: number[],
): number => outputRange[outputRange.length - 1] ?? 0;

export const spring = (): number => 1;
