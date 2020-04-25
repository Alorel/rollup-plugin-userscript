import * as fs from 'fs';
import {UserscriptDefinition} from './UserscriptDefinition';

/** @internal */
export type MetaRunner = () => Promise<UserscriptDefinition>;

/** @internal */
export function resolveMetadataLoader(
  userscript: UserscriptDefinition | (() => UserscriptDefinition | Promise<UserscriptDefinition>)
): MetaRunner {
  if (typeof userscript === 'function') {
    return () => {
      return Promise
        .all([
          resolveBareMeta(),
          runUserscriptFn(userscript)
        ])
        .then(([bareMeta, fullMeta]): UserscriptDefinition => ({
          ...bareMeta,
          ...fullMeta
        }));
    };
  } else if (userscript.version && userscript.name) {
    const ret = Promise.resolve(userscript);

    return () => ret;
  } else {
    return () => {
      return resolveBareMeta()
        .then((bareMeta): UserscriptDefinition => ({
          ...bareMeta,
          ...userscript
        }));
    };
  }
}

type BareMeta = Required<Pick<UserscriptDefinition, 'version' | 'name'>>;

function resolveBareMeta(): Promise<BareMeta> {
  return new Promise<BareMeta>((resolve, reject) => {
    fs.readFile('./package.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        let json: any;
        try {
          json = JSON.parse(data);
        } catch (e) {
          reject(e);

          return;
        }

        resolve({name: json.name, version: json.version});
      }
    });
  });
}

function isPromise<T>(v: any): v is Promise<T> {
  return !!v && typeof v.then === 'function' && typeof v.catch === 'function';
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

  return isPromise(result$) ? result$ : Promise.resolve(result$);
}
