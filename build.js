// const { nodeExternalsPlugin } = require('esbuild-node-externals')

// const esBuild = require('esbuild').build

// const runBuildTask = async (config) => await esBuild(config)

// const baseConfig = {
//   entryPoints: ['index.js'],
//   platform: 'browser',
//   bundle: true,
//   plugins: [
//     nodeExternalsPlugin({
//       dependencies: false,
//     }),
//   ],
//   external: ['three', 'animejs', 'victor'],
// }

// ;(async () => {
//   try {
//     await runBuildTask(
//       Object.assign({}, baseConfig, {
//         outfile: 'dist/index-esm.js',
//         format: 'esm',
//       })
//     )
//     await runBuildTask(
//       Object.assign({}, baseConfig, {
//         outfile: 'dist/index-cjs.js',
//         format: 'cjs',
//       })
//     )
//   } catch (err) {
//     console.log(err)
//     process.exit(1)
//   }
// })()

'use strict'

const fs = require('fs-extra')
const path = require('path')
const rollup = require('rollup')

const { nodeResolve } = require('@rollup/plugin-node-resolve')

const { dependencies } = require('./package.json')

const PROJECT_ENTRY = path.join(__dirname, 'index.js')

const OUTPUT_DIR = path.join(__dirname, 'dist')

const external = Object.keys(dependencies)

const generatorCode = async (format, fileName) => {
  const bundle = await rollup.rollup({
    input: PROJECT_ENTRY,
    external,
    plugins: [nodeResolve()],
  })

  await bundle.write({
    file: path.join(OUTPUT_DIR, fileName),
    format,
    exports: 'auto',
  })
}

const build = async () => {
  await fs.remove(OUTPUT_DIR)
  await generatorCode('cjs', 'index.cjs.js')
  await generatorCode('esm', 'index.esm.js')
}

;(async () => {
  await build()
})()
