import { endent } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import { outputFile, remove } from 'fs-extra'
import P from 'path'

import getEntrySource from './get-entry-source'
import getReadmeInstallString from './get-readme-install-string'

export default async config => ({
  allowedMatches: ['src'],
  commands: {
    prepublishOnly: async () => {
      console.log('prepublishOnly!')
      try {
        await outputFile(P.join('src', 'entry.js'), await getEntrySource())
        await remove('dist')
        await execa(
          packageName`rollup`,
          [
            '--config',
            require.resolve('@dword-design/rollup-config-component'),
          ],
          {
            env: { NODE_ENV: 'production' },
            stdio: 'inherit',
          }
        )
      } finally {
        await remove(P.join('src', 'entry.js'))
      }
    },
  },
  editorIgnore: ['dist', '.browserslistrc'],
  gitignore: ['/dist', '.browserslistrc'],
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
  readmeInstallString: await getReadmeInstallString(config),
})
