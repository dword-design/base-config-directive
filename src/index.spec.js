import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import fileUrl from 'file-url'
import { mkdir, outputFile, remove } from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import outputFiles from 'output-files'

import { vueCdnScript } from './variables'

export default tester(
  {
    directive: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="component" v-tmp-directive />
          </template>

          <script>
          import TmpDirective from '../../tmp-directive'
          
          export default {
            directives: {
              TmpDirective,
            },
          }
          </script>
        `,
      })

      const nuxt = new Nuxt()
      await new Builder(nuxt).build()
      await nuxt.listen()

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto('http://localhost:3000')

        const component = await page.waitForSelector('.component')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await browser.close()
        await nuxt.close()
      }
    },
    plugin: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="component" v-tmp-directive />
          </template>
        `,
        'plugins/plugin.js': endent`
          import Vue from 'vue'
          import TmpDirective from '../../tmp-directive'
          
          Vue.use(TmpDirective)
        `,
      })

      const nuxt = new Nuxt({ plugins: ['~/plugins/plugin.js'] })
      await new Builder(nuxt).build()
      await nuxt.listen()

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto('http://localhost:3000')

        const component = await page.waitForSelector('.component')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await browser.close()
        await nuxt.close()
      }
    },
    script: async () => {
      await outputFile(
        'index.html',
        endent`
        <body>
          ${vueCdnScript}
          <script src="../tmp-directive/dist/index.min.js"></script>
        
          <div id="app"></div>
        
          <script>
            new Vue({
              el: '#app',
              template: '<div class="component" v-tmp-directive />',
            })
          </script>
        </body>
      `
      )

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto(fileUrl('index.html'))

        const component = await page.waitForSelector('.component')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await browser.close()
      }
    },
  },
  [
    {
      after: () => remove('tmp-directive'),
      before: async () => {
        await mkdir('tmp-directive')
        await chdir('tmp-directive', async () => {
          await outputFiles({
            'node_modules/base-config-self/index.js':
              "module.exports = require('../../../src')",
            'package.json': JSON.stringify({
              baseConfig: 'self',
              name: 'tmp-directive',
            }),
            'src/index.js': endent`
              export default {
                bind: el => el.innerText = 'Hello world',
              }
            `,
          })
          await execa.command('base prepare')
          await execa.command('base prepublishOnly')
        })
      },
    },
    testerPluginTmpDir(),
  ]
)
