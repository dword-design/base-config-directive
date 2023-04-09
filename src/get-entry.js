import { endent } from '@dword-design/functions'

import getDirectiveName from './get-directive-name.js'
import getPackageName from './get-package-name.js'

export default () => {
  const packageName = getPackageName()

  const directiveName = getDirectiveName(packageName)

  return endent`
    import directive from './index.js'

    const install = app => app.directive('${directiveName}', directive)

    directive.install = install

    if (typeof window !== 'undefined') {
      window.${directiveName} = directive
    }

    export default directive;
  `
}
