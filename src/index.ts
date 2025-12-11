import pathLib from 'node:path';

import { type Base, defineBaseConfig } from '@dword-design/base';
import getComponentConfig, {
  type BaseConfig as ConfigComponent,
} from '@dword-design/base-config-component';
import fs from 'fs-extra';

import getEntry from './get-entry';
import getReadmeInstallString from './get-readme-install-string';

interface ConfigDirective extends Omit<ConfigComponent, 'componentName'> {
  directiveName?: ConfigComponent['componentName'];
}

export default defineBaseConfig(function (
  this: Base<ConfigDirective>,
  config: ConfigDirective,
) {
  const componentConfig = getComponentConfig.call(this, config);
  return {
    ...componentConfig,
    prepare: async () => {
      await componentConfig.prepare.call(this);

      await fs.outputFile(
        pathLib.join(this.cwd, 'entry.ts'),
        getEntry(config, { cwd: this.cwd }),
      );
    },
    readmeInstallString: getReadmeInstallString(config, { cwd: this.cwd }),
  };
});
