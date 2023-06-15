import { endent } from '@dword-design/functions'
import fs from 'fs-extra'
import P from 'path'
import { build } from 'vite'

import getEntrySource from './get-entry.js'
import getReadmeInstallString from './get-readme-install-string.js'
import viteConfig from './vite-config.js'

export default config => ({
  allowedMatches: ['src'],
  commands: {
    prepublishOnly: async (options = {}) => {
      options = { log: true, ...options }
      try {
        await fs.outputFile(P.join('src', 'entry.js'), await getEntrySource())
        await build({
          ...viteConfig,
          ...(!options.log && { logLevel: 'warn' }),
        })
      } finally {
        await fs.remove(P.join('src', 'entry.js'))
      }
    },
  },
  editorIgnore: ['dist', '.browserslistrc'],
  gitignore: ['/dist', '.browserslistrc'],
  npmPublish: true,
  packageConfig: {
    browser: 'dist/index.min.js',
    exports: './dist/index.esm.js',
    main: 'dist/index.esm.js',
    unpkg: 'dist/index.min.js',
  },
  prepare: () =>
    fs.outputFile(
      '.browserslistrc',
      endent`
        current node
        last 2 versions and > 2%
        ie > 10

      `,
    ),
  readmeInstallString: getReadmeInstallString(config),
})
