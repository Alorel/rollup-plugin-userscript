import * as fs from 'fs';
import {join} from 'path';

/** Get the installed version of the given package */
export function getPkgVersion(name: string): string {
  const path: string = join(process.cwd(), 'node_modules', name, 'package.json');

  return JSON.parse(fs.readFileSync(path, 'utf8')).version;
}
