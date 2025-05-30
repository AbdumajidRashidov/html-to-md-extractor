// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// Shared TypeScript options for Rollup
const tsOptions = {
  target: 'es2018',
  module: 'esnext',
  moduleResolution: 'node',
  lib: ['es2018', 'dom'],
  sourceMap: true,
  removeComments: true,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  resolveJsonModule: true,
  allowSyntheticDefaultImports: true
};

export default [
  // ES Module build with declarations
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      typescript({
        typescript: require('typescript'),
        clean: true,
        tsconfigOverride: {
          compilerOptions: {
            ...tsOptions,
            declaration: true,
            declarationMap: true,
            declarationDir: './dist'
          }
        }
      })
    ],
    external: ['jsdom']
  },
  // CommonJS build without declarations
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      typescript({
        typescript: require('typescript'),
        clean: false,
        declaration: false,
        tsconfigOverride: {
          compilerOptions: {
            ...tsOptions,
            declaration: false,
            declarationMap: false
          }
        }
      })
    ],
    external: ['jsdom']
  }
];