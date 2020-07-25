/// <reference types="node" />
import * as fs from 'fs';
import debug from 'debug';
declare const THIS_MIGRATIONS_PATH = "/sql/migrations-table.sql";
declare const POSTGRES_URL: string | undefined;
declare const log: debug.Debugger;
declare const USER_MIGRATIONS_PATH: string;
declare const fsAsync: typeof fs.promises;
export { log, THIS_MIGRATIONS_PATH, USER_MIGRATIONS_PATH, fsAsync, POSTGRES_URL };
