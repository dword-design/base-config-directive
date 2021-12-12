import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginPuppeteer from '@dword-design/tester-plugin-puppeteer'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import fileUrl from 'file-url'
import { mkdir, outputFile, remove } from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import outputFiles from 'output-files'

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
      await outputFile(
        'index.html',
        endent`
        <body>
          <script src="https://unpkg.com/vue"></script>
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
      await this.page.goto(fileUrl('index.html'))

      const component = await this.page.waitForSelector('.component')
      expect(await component.evaluate(el => el.innerText)).toEqual(
        'Hello world'
      )
    },
  },
  [
    {
      after: () => remove('tmp-directive'),
      before: async () => {
        await mkdir('tmp-directive')
        await chdir('tmp-directive', async () => {
          await outputFiles({
            '.baserc.json': JSON.stringify({ name: 'self' }),
            'node_modules/base-config-self/index.js':
              "module.exports = require('../../../src')",
            'package.json': JSON.stringify({ name: 'tmp-directive' }),
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
    testerPluginPuppeteer(),
    testerPluginTmpDir(),
  ]
)
