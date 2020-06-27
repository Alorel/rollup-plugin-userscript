import {OutputPlugin, PluginContext} from 'rollup';
import {resolveMetadataLoader} from './meta-runner';
import {MetablockStringifier} from './MetablockStringifier';
import {UserscriptDefinition} from './UserscriptDefinition';

export interface UserscriptPluginOpts {
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
    metaFileName,
    userscript
  } = opts;

  if (!userscript) {
    throw new Error('Userscript not provided');
  }

  const getMetablock = resolveMetadataLoader(userscript);
  let metaString: string;

  const out: OutputPlugin = {
    name: 'userscript-plugin',
    async banner(): Promise<string> {
      const metaBlock = await getMetablock();
      metaString = new MetablockStringifier(metaBlock).toString();

      return metaString;
    }
  };

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
