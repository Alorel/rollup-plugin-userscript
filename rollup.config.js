import {join} from 'path';
import {cleanPlugin} from '@alorel/rollup-plugin-clean';
import {copyPkgJsonPlugin} from "@alorel/rollup-plugin-copy-pkg-json";
import {copyPlugin} from "@alorel/rollup-plugin-copy";
import nodeResolve from '@rollup/plugin-node-resolve';
import {promises as fs} from 'fs';
import {dtsPlugin} from '@alorel/rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';

const distDir = join(__dirname, 'dist');
const srcDir = join(__dirname, 'src');

function mkNodeResolve() {
  return nodeResolve({
    mainFields: ['fesm5', 'esm5', 'module', 'browser', 'main'],
    extensions: ['.js', '.ts']
  });
}

export default ({watch}) => {
  const baseOutput = {
    dir: distDir,
    sourcemap: false,
    ...(() => {
      if (!watch) {
        return {
          banner() {
            return fs.readFile(join(__dirname, 'LICENSE'), 'utf8')
              .then(f => `/*\n${f.trim()}\n*/\n`)
          }
        }
      }

      return {};
    })()
  };

  return {
    input: join(srcDir, 'index.ts'),
    external: [
      'lazy-get-decorator',
      'tslib',
      'magic-string',
      'path',
      'fs'
    ],
    output: [
      {
        ...baseOutput,
        entryFileNames: '[name].js',
        format: 'cjs'
      },
      {
        ...baseOutput,
        entryFileNames: '[name].es.js',
        format: 'es',
        plugins: watch ? [] : [
          copyPkgJsonPlugin({
            unsetPaths: ['devDependencies', 'scripts']
          }),
          dtsPlugin({
            cliArgs: ['--rootDir', 'src']
          })
        ]
      }
    ],
    plugins: [
      cleanPlugin({dir: distDir}),
      mkNodeResolve(),
      copyPlugin({
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
      }),
      typescript()
    ],
    watch: {
      exclude: 'node_modules/*'
    }
  }
};
