import {LazyGetter} from 'lazy-get-decorator';
import {UserscriptDefinition} from './UserscriptDefinition';

const enum Conf {
  DEFAULT_PAD_OVERHEAD = 5
}

/** @internal */
export class MetablockStringifier {
  public constructor(private readonly metaBlock: UserscriptDefinition) {
  }

  @LazyGetter()
  private get entries(): [keyof UserscriptDefinition, any][] {
    return Object.entries(this.metaBlock);
  }

  @LazyGetter()
  private get keyPadLength(): number {
    if (!this.entries.length) {
      return 0;
    }

    return Math.max(...this.entries.map(getLength)) + Conf.DEFAULT_PAD_OVERHEAD;
  }

  public toString(): string {
    let out = '// ==UserScript==\n';

    let res: string | void;
    for (const [key, value] of this.entries) {
      res = this.process(key, value);
      if (res) {
        out += res;
      }
    }

    return out + '// ==/UserScript==\n\n';
  }

  private process(key: keyof UserscriptDefinition, value: any): string | void {
    if (Array.isArray(value)) {
      return (value)
        .reduce<string>(
          (acc, v) => {
            const out = this.process(key, v);

            return out ? acc + out : acc;
          },
          ''
        );
    }

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'bigint':
        return `// @${key} `.padEnd(this.keyPadLength, ' ') + `${value}\n`;
      case 'boolean':
        if (value) {
          return `// @${key}\n`;
        }
    }
  }
}

function getLength(v: [string, any]): number {
  return v[0].length;
}
