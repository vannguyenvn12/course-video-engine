import {Config} from '@remotion/cli/config';
import {withTypeScriptExtensionAlias} from './src/remotion/webpack-extension-alias';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(withTypeScriptExtensionAlias);
