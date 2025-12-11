import { getComponentName } from '@dword-design/base-config-component';
import endent from 'endent';

import getPackageName from './get-package-name';
import { VUE_CDN_SCRIPT } from './variables';

export default (
  config: { cdnExtraScripts?: string[]; directiveName?: string } = {},
  { cwd = '.' } = {},
) => {
  config.cdnExtraScripts = config.cdnExtraScripts || [];
  const packageName = getPackageName({ cwd });

  const directiveName = getComponentName(
    { componentName: config.directiveName },
    { cwd },
  );

  return endent`
    ## Install via a package manager

    \`\`\`bash
    # npm
    $ npm install ${packageName}

    # Yarn
    $ yarn add ${packageName}
    \`\`\`

    Add to local directives:

    \`\`\`js
    <script>
    import ${directiveName} from '${packageName}'

    export default {
      directives: {
        ${directiveName},
      },
    }
    </script>
    \`\`\`

    Or register as a global directive:

    \`\`\`js
    import Vue from 'vue'
    import ${directiveName} from '${packageName}'

    Vue.directive('${directiveName}', ${directiveName})
    \`\`\`

    Or register as a plugin:

    \`\`\`js
    import Vue from 'vue'
    import ${directiveName} from '${packageName}'

    Vue.use(${directiveName})
    \`\`\`

    ## Install via CDN

    \`\`\`html
    ${[
      VUE_CDN_SCRIPT,
      ...config.cdnExtraScripts,
      `<script src="https://unpkg.com/${packageName}"></script>`,
    ].join('\n')}
    \`\`\`
  `;
};
