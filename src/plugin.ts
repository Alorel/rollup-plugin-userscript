import {OutputPlugin, PluginContext} from 'rollup';
import {resolveMetadataLoader} from './lib/meta-runner';
import {MetablockStringifier} from './lib/MetablockStringifier';
import {UserscriptDefinition} from './lib/UserscriptDefinition';

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

  function onMetablockGenerated(def: UserscriptDefinition): string {
    return metaString = new MetablockStringifier(def).toString();
  }

  const out: OutputPlugin = {
    name: 'userscript-plugin',
    banner(): Promise<string> {
      return getMetablock().then(onMetablockGenerated);
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
