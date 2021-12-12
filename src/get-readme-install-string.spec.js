import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'

import self from './get-readme-install-string'

export default tester(
  {
    'extra scripts': async function () {
      await outputFile('package.json', JSON.stringify({ name: 'foo-bar' }))
      expect(
        await self({
          cdnExtraScripts: [
            '<script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>',
          ],
        })
      ).toMatchSnapshot(this)
    },
    async valid() {
      await outputFile('package.json', JSON.stringify({ name: 'foo-bar' }))
      expect(await self()).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)
