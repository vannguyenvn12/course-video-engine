import {describe, expect, it} from 'vitest';
import {executeGeometryTool} from '../src/geometry/execute-tool-call.js';

describe('geometry tools', () => {
  it('place_polygon returns SVG path', () => {
    const r = executeGeometryTool('place_polygon', {
      sides: 8,
      center: {x: 0.5, y: 0.5},
      radius: 0.2,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.path).toMatch(/^M /);
      expect(r.path.endsWith(' Z')).toBe(true);
    }
  });
});
