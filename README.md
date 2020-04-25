# rollup-plugin-userscript

Generates userscript metablocks and, optionally, outputs a separate matadata file.

-----

# Installation

[Configure npm for GitHub packages](https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages)
then install `@alorel/rollup-plugin-userscript`

# Example

```javascript
import {getPkgVersion, userscriptPlugin} from '@alorel/rollup-plugin-userscript';

export default {
  // ... your default options
  output: {
    // It can function as an output plugin
    plugins: [
      userscriptPlugin({
        userscript: {
          // name & version inherited from package.json by default, but can be overridden
          namespace: 'org.foo',
          noframes: true,
          grant: [
            'GM_getValue',
            'GM_setValue'
          ]        
        }
      })
    ]
  },
  // Or it can function as a regular plugin
  plugins: [
    userscriptPlugin({
      // If provided, a separate meta file will be emitted too
      metaFileName: 'index.meta.js',
      // It can also be a function that returns synchronously or through a promise
      userscript() {
        return {
          // ...
          // getPkgVersion can be used to help generate CDN links
          require: `https://cdn.jsdelivr.net/npm/lodash@${getPkgVersion('lodash')}/lodash.min.js`
        };
      }
    })
  ]
}
```

# API

```typescript
interface UserscriptPluginOpts {
    /** If provided, a metadata file will be emitted */
    metaFileName?: string;
    /** Userscript definition or a factory function to produce one */
    userscript: UserscriptDefinition | (() => UserscriptDefinition | Promise<UserscriptDefinition>);
}

interface UserscriptDefinition {
    author: string;
    description: string;
    downloadURL?: string;
    exclude?: string | string[];
    grant?: string | string[];
    homepage?: string;
    icon?: string;
    icon16?: string;
    icon32?: string;
    icon64?: string;
    include?: string | string[];
    match?: string | string[];
    /** Defaults to package.json name */
    name?: string;
    namespace: string;
    noframes?: boolean;
    require?: string | string[];
    resource?: string | string[];
    'run-at'?: string;
    updateURL?: string;
    /** Defaults to package.json version */
    version?: string;
    [k: string]: any;
}
```
