import { Base } from '@dword-design/base'
import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginPuppeteer from '@dword-design/tester-plugin-puppeteer'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fileUrl from 'file-url'
import fs from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import outputFiles from 'output-files'
import P from 'path'

import self from './index.js'

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

      const nuxt = new Nuxt()
      await new Builder(nuxt).build()
      await nuxt.listen()
      try {
        await this.page.goto('http://localhost:3000')

        const component = await this.page.waitForSelector('.component')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await nuxt.close()
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
          import Vue from 'vue'
          import TmpDirective from '../../tmp-directive'
          
          Vue.use(TmpDirective)
        `,
      })

      const nuxt = new Nuxt({ plugins: ['~/plugins/plugin.js'] })
      await new Builder(nuxt).build()
      await nuxt.listen()
      this.page
        .on('console', message =>
          console.log(
            `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
          )
        )
        .on('pageerror', context => console.log(context.message))
        .on('response', response =>
          console.log(`${response.status()} ${response.url()}`)
        )
        .on('requestfailed', request =>
          console.log(`${request.failure().errorText} ${request.url()}`)
        )
      try {
        await this.page.goto('http://localhost:3000')

        const component = await this.page.waitForSelector('.component')
        await new Promise(resolve => setTimeout(resolve, 1000))
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world'
        )
      } finally {
        await nuxt.close()
      }
    },
    async script() {
      await fs.outputFile(
        'index.html',
        endent`
        <body>
          <script src="https://unpkg.com/vue"></script>
          <script src="../tmp-directive"></script>
        
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
      await this.page.goto(fileUrl('index.html'))

      const component = await this.page.waitForSelector('.component')
      expect(await component.evaluate(el => el.innerText)).toEqual(
        'Hello world'
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
              baseConfig: P.resolve('..', 'src', 'index.js'),
              name: 'tmp-directive',
              type: 'module',
            }),
            'src/index.js': endent`
              export default {
                bind: el => el.innerText = 'Hello world',
              }
            `,
          })
          await new Base(self).prepare()
          await self().commands.prepublishOnly({ log: false })
        })
      },
    },
    testerPluginPuppeteer(),
    testerPluginTmpDir(),
  ]
)
