import {promises as fs} from 'fs';
import {UserscriptDefinition} from './UserscriptDefinition';

/** @internal */
export type MetaRunner = () => Promise<UserscriptDefinition>;

/** @internal */
export function resolveMetadataLoader(
  userscript: UserscriptDefinition | (() => UserscriptDefinition | Promise<UserscriptDefinition>)
): MetaRunner {
  if (typeof userscript === 'function') {
    return async function functionMetadataLoader(): Promise<UserscriptDefinition> {
      const [bareMeta, fullMeta] = await Promise.all([resolveBareMeta(), runUserscriptFn(userscript)]);

      return {...bareMeta, ...fullMeta};
    };
  } else if (userscript.version && userscript.name) {
    const ret = Promise.resolve(userscript);

    return function constantMetadataLoader(): Promise<UserscriptDefinition> {
      return ret;
    };
  } else {
    return async function partialMetadataLoader(): Promise<UserscriptDefinition> {
      const bareMeta = await resolveBareMeta();

      return {...bareMeta, ...userscript};
    };
  }
}

type BareMeta = Required<Pick<UserscriptDefinition, 'version' | 'name'>>;

async function resolveBareMeta(): Promise<BareMeta> {
  const data = await fs.readFile('./package.json', 'utf8');
  const {name, version} = JSON.parse(data);

  return {name, version};
}

function runUserscriptFn(
  fn: () => UserscriptDefinition | Promise<UserscriptDefinition>
): Promise<UserscriptDefinition> {
  let result$: UserscriptDefinition | Promise<UserscriptDefinition>;
  try {
    result$ = fn();
  } catch (e) {
    return Promise.reject(e);
  }

  return Promise.resolve(result$);
}
