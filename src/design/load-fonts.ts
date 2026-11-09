import {continueRender, delayRender, staticFile} from 'remotion';

const FONT_FILES = [
  {family: 'IBMPlexSans', weight: '200', file: 'fonts/IBMPlexSans-Light.woff2'},
  {family: 'IBMPlexSans', weight: '400', file: 'fonts/IBMPlexSans-Regular.woff2'},
  {family: 'IBMPlexSans', weight: '700', file: 'fonts/IBMPlexSans-Bold.woff2'},
  {family: 'IBMPlexMono', weight: '400', file: 'fonts/IBMPlexMono-Regular.woff2'},
] as const;

let fontsLoaded = false;

export const loadCourseFonts = async (): Promise<void> => {
  if (fontsLoaded) {
    return;
  }
  const handle = delayRender('load-course-fonts');
  try {
    await Promise.all(
      FONT_FILES.map(async ({family, weight, file}) => {
        const url = staticFile(file);
        const face = new FontFace(family, `url(${url})`, {weight});
        const loaded = await face.load();
        document.fonts.add(loaded);
      }),
    );
    await document.fonts.ready;
    fontsLoaded = true;
  } finally {
    continueRender(handle);
  }
};

export const assertFontsReady = (): {ok: boolean; missing: string[]} => {
  const checks = [
    '200 1em IBMPlexSans',
    '400 1em IBMPlexSans',
    '700 1em IBMPlexSans',
    '400 1em IBMPlexMono',
  ];
  const missing = checks.filter((spec) => !document.fonts.check(spec));
  return {ok: missing.length === 0, missing};
};
