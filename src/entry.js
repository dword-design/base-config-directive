import { endent } from '@dword-design/functions'
import loadPkg from 'load-pkg'
import parsePackagejsonName from 'parse-packagejson-name'
import { pascalCase } from 'pascal-case'

const packageConfig = loadPkg.sync()

const packageName = parsePackagejsonName(packageConfig.name).fullName

const directiveName = packageName |> pascalCase

export default endent`
  // Import directive
  import directive from '.';

  // install function executed by Vue.use()
  const install = function installVueIcon(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.directive('${directiveName}', directive);
  };

  // Create module definition for Vue.use()
  const plugin = {
    install,
  };

  // To auto-install on non-es builds, when vue is found
  // eslint-disable-next-line no-redeclare
  /* global window, global */
  if ('false' === process.env.ES_BUILD) {
    let GlobalVue = null;
    if (typeof window !== 'undefined') {
      GlobalVue = window.Vue;
    } else if (typeof global !== 'undefined') {
      GlobalVue = global.Vue;
    }
    if (GlobalVue) {
      GlobalVue.use(plugin);
    }
  }

  // Inject install function into directive - allows directive
  // to be registered via Vue.use() as well as Vue.directive()
  directive.install = install;

  // Export directive by default
  export default directive;
`
