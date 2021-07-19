import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require-no-leak'

export default tester(
  {
    string: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: 'directive',
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./base-config'))
      ).toEqual({ cdnExtraScripts: [] })
    },
    undefined: async () => {
      await outputFile('package.json', JSON.stringify({}))
      expect(
        stealthyRequire(require.cache, () => require('./base-config'))
      ).toEqual({ cdnExtraScripts: [] })
    },
    valid: async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: {
            cdnExtraScripts: [
              '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
            ],
            name: 'directive',
          },
        })
      )
      expect(
        stealthyRequire(require.cache, () => require('./base-config'))
      ).toEqual({
        cdnExtraScripts: [
          '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
        ],
        name: 'directive',
      })
    },
  },
  [testerPluginTmpDir()]
)
