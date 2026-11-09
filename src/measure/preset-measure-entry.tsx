import {createRoot} from 'react-dom/client';
import {PresetStage} from '../presets/PresetStage';
import {loadCourseFontsForDom} from '../design/load-fonts-dom';
import {canvas} from '../design/tokens';

const rootEl = document.getElementById('root') ?? document.body;
const mountHost = document.createElement('div');
mountHost.id = 'preset-measure-root';
rootEl.appendChild(mountHost);

const props = window.__PRESET_MEASURE__ as {preset: string; slots: Record<string, unknown>};

const mount = async () => {
  await loadCourseFontsForDom();
  document.body.dataset.fontsReady = 'true';
  createRoot(mountHost).render(<PresetStage preset={props.preset} slots={props.slots} />);
};

document.body.style.margin = '0';
document.body.style.width = `${canvas.width}px`;
document.body.style.height = `${canvas.height}px`;
document.body.style.overflow = 'hidden';
document.body.style.background = '#0a0909';

void mount();

declare global {
  interface Window {
    __PRESET_MEASURE__: {preset: string; slots: Record<string, unknown>};
  }
}
