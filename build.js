const { nodeExternalsPlugin } = require('esbuild-node-externals')

const esBuild = require('esbuild').build

const runBuildTask = async (config) => await esBuild(config)

const baseConfig = {
  entryPoints: ['index.js'],
  platform: 'browser',
  bundle: true,
  plugins: [
    nodeExternalsPlugin({
      dependencies: false,
    }),
  ],
  external: ['three', 'animejs', 'victor'],
}

;(async () => {
  try {
    await runBuildTask(
      Object.assign({}, baseConfig, {
        outfile: 'dist/index-esm.js',
        format: 'esm',
      })
    )
    await runBuildTask(
      Object.assign({}, baseConfig, {
        outfile: 'dist/index-cjs.js',
        format: 'cjs',
      })
    )
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
})()
