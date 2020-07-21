import nodeConfig from '@dword-design/base-config-node'
import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import { endent } from '@dword-design/functions'
import depcheckParserVue from 'depcheck-parser-vue'
import execa from 'execa'
import { outputFile, remove } from 'fs-extra'
import P from 'path'

import entry from './entry'
import lint from './lint'

export default {
  ...nodeConfig,
  commands: {
    prepublishOnly: async () => {
      try {
        await outputFile(P.join('src', 'entry.js'), entry)
        await remove('dist')
        await execa(
          'rollup',
          [
            '--config',
            require.resolve('@dword-design/rollup-config-component'),
          ],
          {
            env: { NODE_ENV: 'production', stdio: 'inherit' },
          }
        )
      } finally {
        await remove(P.join('src', 'entry.js'))
      }
    },
  },
  depcheckConfig: {
    parsers: {
      '*.scss': depcheckParserSass,
      '*.vue': depcheckParserVue,
    },
  },
  editorIgnore: [...nodeConfig.editorIgnore, '.browserslistrc'],
  gitignore: [...nodeConfig.gitignore, '.browserslistrc'],
  lint,
  npmPublish: true,
  packageConfig: {
    browser: 'dist/index.esm.js',
    main: 'dist/index.ssr.js',
    module: 'dist/index.esm.js',
    unpkg: 'dist/index.min.js',
  },
  prepare: () =>
    outputFile(
      '.browserslistrc',
      endent`
        current node
        last 2 versions and > 2%
        ie > 10
        
      `
    ),
  useJobMatrix: true,
}
