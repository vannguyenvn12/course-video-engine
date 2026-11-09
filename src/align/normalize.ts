/** Match key for script ↔ whisper (script text is canonical display form). */
export const normalizeToken = (raw: string): string => {
  return raw
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[^a-z0-9']/g, '')
    .trim();
};
