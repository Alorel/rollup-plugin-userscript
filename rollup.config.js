import typescript from 'rollup-plugin-typescript2';
import {join} from 'path';
import {dependencies, peerDependencies} from './package.json';
import {cleanPlugin} from '@alorel/rollup-plugin-clean';
import {copyPkgJsonPlugin as copyPkgJson} from '@alorel/rollup-plugin-copy-pkg-json';
import {dtsPlugin as dts} from '@alorel/rollup-plugin-dts';
import {copyPlugin as cpPlugin} from '@alorel/rollup-plugin-copy';

function mkOutput(overrides = {}) {
  return {
    entryFileNames: '[name].js',
    assetFileNames: '[name][extname]',
    sourcemap: false,
    ...overrides
  };
}

const baseSettings = {
  input: join(__dirname, 'src', 'index.ts'),
  external: Array.from(
    new Set(
      Object.keys(dependencies)
        .concat(Object.keys(peerDependencies))
        .concat('util', 'fs', 'path', 'crypto')
    )
  ),
  preserveModules: true,
  watch: {
    exclude: 'node_modules/*'
  }
}

function plugins(add = [], tscOpts = {}) {
  return [
    typescript({
      tsconfig: join(__dirname, 'tsconfig.json'),
      ...tscOpts
    })
  ].concat(add);
}

export default [
  {
    ...baseSettings,
    output: mkOutput({
      dir: join(__dirname, 'dist'),
      format: 'cjs',
      plugins: [
        copyPkgJson({
          unsetPaths: ['devDependencies', 'scripts']
        }),
        dts()
      ]
    }),
    plugins: plugins([
      cleanPlugin({
        dir: join(__dirname, 'dist')
      }),
      cpPlugin({
        defaultOpts: {
          glob: {
            cwd: __dirname
          },
          emitNameKind: 'fileName'
        },
        copy: [
          'LICENSE',
          'CHANGELOG.md',
          'README.md'
        ]
      })
    ])
  },
  {
    ...baseSettings,
    output: mkOutput({
      dir: join(__dirname, 'dist', 'esm'),
      format: 'esm'
    }),
    plugins: plugins([], {outDir: 'dist/esm'})
  }
];
