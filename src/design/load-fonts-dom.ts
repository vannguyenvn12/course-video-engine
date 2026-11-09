const FONT_FILES = [
  {family: 'IBMPlexSans', weight: '200', file: '/fonts/IBMPlexSans-Light.woff2'},
  {family: 'IBMPlexSans', weight: '400', file: '/fonts/IBMPlexSans-Regular.woff2'},
  {family: 'IBMPlexSans', weight: '700', file: '/fonts/IBMPlexSans-Bold.woff2'},
  {family: 'IBMPlexMono', weight: '400', file: '/fonts/IBMPlexMono-Regular.woff2'},
] as const;

let fontsLoaded = false;

export const loadCourseFontsForDom = async (): Promise<void> => {
  if (fontsLoaded) {
    return;
  }
  await Promise.all(
    FONT_FILES.map(async ({family, weight, file}) => {
      const face = new FontFace(family, `url(${file})`, {weight});
      const loaded = await face.load();
      document.fonts.add(loaded);
    }),
  );
  await document.fonts.ready;
  fontsLoaded = true;
};
