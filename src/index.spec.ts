import pathLib from 'node:path';

import { Base } from '@dword-design/base';
import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import fileUrl from 'file-url';
import getPort from 'get-port';
import nuxtDevReady from 'nuxt-dev-ready';
import outputFiles from 'output-files';
import kill from 'tree-kill-promise';

import { VUE_CDN_SCRIPT } from './variables';

test('directive', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'app/pages/index.vue': endent`
      <template>
        <div class="component" v-tmp-directive />
      </template>

      <script setup>
      import vTmpDirective from 'tmp-directive';
      </script>
    `,
    'node_modules/tmp-directive': {
      'package.json': JSON.stringify({ name: 'tmp-directive', type: 'module' }),
      'src/index.ts':
        "export default { beforeMount: (el: Element) => el.classList.add('foo') };",
    },
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-directive') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: String(port) },
    reject: false,
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.component')).toContainClass('foo');
  } finally {
    await kill(nuxt.pid!);
  }
});

test('plugin', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    app: {
      'pages/index.vue': endent`
        <template>
          <div class="component" v-tmp-directive />
        </template>
      `,
      'plugins/plugin.ts': endent`
        import TmpDirective from 'tmp-directive';

        export default defineNuxtPlugin(nuxtApp => nuxtApp.vueApp.use(TmpDirective));
      `,
    },
    'node_modules/tmp-directive': {
      'package.json': JSON.stringify({ name: 'tmp-directive', type: 'module' }),
      'src/index.ts':
        "export default { beforeMount: (el: Element) => el.classList.add('foo') };",
    },
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-directive') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: String(port) },
    reject: false,
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.component')).toContainClass('foo');
  } finally {
    await kill(nuxt.pid!);
  }
});

test('script', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.html': endent`
      <body>
        ${VUE_CDN_SCRIPT}
        <script src="./node_modules/tmp-directive/dist/index.min.js"></script>

        <div id="app"></div>

        <script>
          const app = Vue.createApp({
            template: '<div class="component" v-tmp-directive />',
          });
          app.directive('TmpDirective', TmpDirective);
          app.mount('#app');
        </script>
      </body>
    `,
    'node_modules/tmp-directive': {
      'package.json': JSON.stringify({ name: 'tmp-directive', type: 'module' }),
      'src/index.ts':
        "export default { beforeMount: (el: Element) => el.classList.add('foo') };",
    },
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-directive') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  await page.goto(fileUrl(pathLib.join(cwd, 'index.html')));
  await expect(page.locator('.component')).toContainClass('foo');
});
