import esbuild from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

esbuild.build({
  entryPoints: ['./src/lambdas/**/*.ts'],
  bundle: true,
  outdir: './lambdas',
  platform: 'node',
  target: 'es2020',
  sourcemap: true,
  external: ['fs', 'path'],
  loader: { '.ts': 'ts' },
  plugins: [esbuildPluginTsc()],
  outbase: './src/lambdas',
  entryNames: '[dir]/[name]'
}).catch(() => process.exit(1));