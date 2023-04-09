import { Base } from '@dword-design/base'
import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginPuppeteer from '@dword-design/tester-plugin-puppeteer'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import fileUrl from 'file-url'
import fs from 'fs-extra'
import outputFiles from 'output-files'
import portReady from 'port-ready'
import kill from 'tree-kill-promise'

import { vueCdnScript } from './variables.js'

import { vueCdnScript } from './variables'

export default tester(
  {
    async directive() {
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

      const nuxt = execaCommand('nuxt dev')
      try {
        await portReady(3000)
        await this.page.goto('http://localhost:3000')

        const component = await this.page.waitForSelector('.component')
        await this.page.waitForFunction(
          el => el.innerText === 'Hello world',
          {},
          component,
        )
      } finally {
        await kill(nuxt.pid)
      }
    },
    async plugin() {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="component" v-tmp-directive />
          </template>
        `,
        'plugins/plugin.js': endent`
          import TmpDirective from '../../tmp-directive'

          export default defineNuxtPlugin(nuxtApp => nuxtApp.vueApp.use(TmpDirective))
        `,
      })

      const nuxt = execaCommand('nuxt dev')
      try {
        await portReady(3000)
        await this.page.goto('http://localhost:3000')

        const component = await this.page.waitForSelector('.component')
        await this.page.waitForFunction(
          el => el.innerText === 'Hello world',
          {},
          component,
        )
      } finally {
        await kill(nuxt.pid)
      }
    },
    async script() {
      await fs.outputFile(
        'index.html',
        endent`
          <body>
            ${vueCdnScript}
            <script src="../tmp-directive/dist/index.min.js"></script>

            <div id="app"></div>

            <script>
              const app = Vue.createApp({
                template: '<div class="component" v-tmp-directive />',
              })
              app.directive('TmpDirective', TmpDirective)
              app.mount('#app')
            </script>
          </body>
        `,
      )
      await await this.page.goto(fileUrl('index.html'))

      const component = await this.page.waitForSelector('.component')
      await this.page.waitForFunction(
        el => el.innerText === 'Hello world',
        {},
        component,
      )
    },
  },
  [
    {
      after: () => fs.remove('tmp-directive'),
      before: async () => {
        await fs.mkdir('tmp-directive')
        await chdir('tmp-directive', async () => {
          await outputFiles({
            'package.json': JSON.stringify({
              name: 'tmp-directive',
              type: 'module',
            }),
            'src/index.js': endent`
              export default {
                beforeMount: el => el.innerText = 'Hello world',
              }
            `,
          })

          const base = new Base({ name: '../src/index.js' })
          await base.prepare()
          await base.run('prepublishOnly', { log: false })
        })
      },
    },
    testerPluginPuppeteer(),
    testerPluginTmpDir(),
  ],
)
