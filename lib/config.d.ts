/// <reference types="node" />
import * as fs from 'fs';
import debug from 'debug';
declare const NODE_ENV: string | undefined, DATABASE_URL: string | undefined;
declare const log: debug.Debugger;
declare const USER_MIGRATIONS_PATH: string;
declare const fsAsync: typeof fs.promises;
export { log, USER_MIGRATIONS_PATH, fsAsync, DATABASE_URL, NODE_ENV };
