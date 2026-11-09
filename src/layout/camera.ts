import {canvas, layout} from '../design/tokens.js';
import type {Bbox} from './bbox.js';
import {bboxCenter} from './bbox.js';

export type CameraState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Focus camera on target bbox; keeps target center inside safe area at scale ≤ 1.25.
 */
export const cameraForFocus = (target: Bbox, safe = layout.safeArea): CameraState => {
  const center = bboxCenter(target);
  const focusScale = 1.15;
  const safeW = canvas.width - safe * 2;
  const safeH = canvas.height - safe * 2;

  let scale = focusScale;
  if (target.width * scale > safeW || target.height * scale > safeH) {
    scale = Math.min(safeW / target.width, safeH / target.height, 1);
  }
  scale = Math.min(scale, 1.25);

  const frameCenterX = canvas.width / 2;
  const frameCenterY = canvas.height / 2;
  const offsetX = frameCenterX - center.x * scale;
  const offsetY = frameCenterY - center.y * scale;

  const projectedX = center.x * scale + offsetX;
  const projectedY = center.y * scale + offsetY;

  if (
    projectedX < safe ||
    projectedX > canvas.width - safe ||
    projectedY < safe ||
    projectedY > canvas.height - safe
  ) {
    return {scale: 1, offsetX: 0, offsetY: 0};
  }

  return {scale, offsetX, offsetY};
};
