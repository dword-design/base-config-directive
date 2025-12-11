import { getComponentName } from '@dword-design/base-config-component';
import endent from 'endent';

export default (config: { directiveName?: string }, { cwd = '.' } = {}) => {
  const directiveName = getComponentName(
    { componentName: config.directiveName },
    { cwd },
  );

  return endent`
    import type { App } from 'vue';

    import directive from './src';

    const directivePlugin = {
      ...directive,
      install: (app: App) => app.directive('${directiveName}', directive),
    };

    if (typeof globalThis !== 'undefined') {
      (globalThis as Record<string, unknown>).${directiveName} = directivePlugin;
    }

    export default directivePlugin;
  `;
};
