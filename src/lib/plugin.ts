import MagicString from 'magic-string';
import {OutputPlugin, PluginContext, RenderChunkHook} from 'rollup';
import {BuildStage, isBuildStage} from './BuildStage';
import {resolveMetadataLoader} from './meta-runner';
import {MetablockStringifier} from './MetablockStringifier';
import {UserscriptDefinition} from './UserscriptDefinition';

export interface UserscriptPluginOpts {
  /**
   * What stage of the build this plugin should run at. Useful if you, for example, want to minify the plugin
   * @default banner
   */
  buildStage?: BuildStage;

  /** If provided, a metadata file will be emitted */
  metaFileName?: string;

  /** Userscript definition or a factory function to produce one */
  userscript: UserscriptDefinition | (() => UserscriptDefinition | Promise<UserscriptDefinition>);
}

export function userscriptPlugin(opts: UserscriptPluginOpts): OutputPlugin {
  if (!opts) {
    throw new Error('Options required');
  }

  const {
    buildStage = 'banner',
    metaFileName,
    userscript
  } = opts;

  if (!userscript) {
    throw new Error('Userscript not provided');
  } else if (!isBuildStage(buildStage)) {
    throw new Error(`Invalid build stage: ${buildStage}`);
  }

  const getMetablock = resolveMetadataLoader(userscript);
  let metaString: string;

  async function getMetaString(): Promise<string> {
    const metaBlock = await getMetablock();
    metaString = new MetablockStringifier(metaBlock).toString();

    return metaString;
  }

  const out: OutputPlugin = {
    name: 'userscript-plugin'
  };

  if (buildStage === 'banner') {
    out.banner = getMetaString;
  } else {
    out.renderChunk = async function (code) {
      const ms = new MagicString(code);
      ms.appendLeft(0, await getMetaString());

      return {
        code: ms.toString(),
        map: ms.generateMap({hires: true})
      };
    } as RenderChunkHook;
  }

  if (metaFileName) {
    out.generateBundle = function (this: PluginContext) {
      this.emitFile({
        fileName: metaFileName,
        source: metaString,
        type: 'asset'
      });
    };
  }

  return out;
}
