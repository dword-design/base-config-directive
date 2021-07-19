import { endent, join } from '@dword-design/functions'

import baseConfig from './base-config'
import directiveName from './directive-name'
import packageName from './package-name'

export default endent`
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
      ...baseConfig.cdnExtraScripts,
      `<script src="https://unpkg.com/${packageName}"></script>`,
    ] |> join('\n')
  }
  \`\`\`
`
