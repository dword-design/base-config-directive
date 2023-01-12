import { endent, join } from '@dword-design/functions'

import getDirectiveName from './get-directive-name.js'
import getPackageName from './get-package-name.js'

export default (config = {}) => {
  config = { cdnExtraScripts: [], ...config }

  const packageName = getPackageName()

  const directiveName = getDirectiveName(packageName)

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
    ${
      [
        '<script src="https://unpkg.com/vue"></script>',
        ...config.cdnExtraScripts,
        `<script src="https://unpkg.com/${packageName}"></script>`,
      ] |> join('\n')
    }
    \`\`\`
  `
}
