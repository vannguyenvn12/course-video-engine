export type LayoutFile = {
  lecture: string;
  scenes: {
    sceneId: string;
    preset: string;
    beats: {beatIndex: number; boxes: Record<string, {id: string; x: number; y: number; width: number; height: number}>}[];
  }[];
};
