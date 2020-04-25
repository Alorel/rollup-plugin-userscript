export interface UserscriptDefinition {
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
