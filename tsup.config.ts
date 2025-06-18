import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: {
    cli: 'src/cli/index.ts',
  },
  outDir: 'build',
  format: ['cjs', 'esm'], // Change from 'esm' to 'cjs'
  dts: true,
  cjsInterop: true,
  splitting: true,
  bundle: true,
  outExtension: (ctx) => ({
    js: ctx.format === 'cjs' ? '.cjs' : '.mjs',
  }),
  sourcemap: true,
});
