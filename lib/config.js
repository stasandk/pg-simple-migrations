"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTGRES_URL = exports.fsAsync = exports.USER_MIGRATIONS_PATH = exports.THIS_MIGRATIONS_PATH = exports.log = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const debug_1 = __importDefault(require("debug"));
const THIS_MIGRATIONS_PATH = '/sql/migrations-table.sql';
exports.THIS_MIGRATIONS_PATH = THIS_MIGRATIONS_PATH;
const USER_INPUT = process.argv[2];
const NAMESPACE_PREFIX = 'postgres-simple-migrations';
const { POSTGRES_URL } = process.env;
exports.POSTGRES_URL = POSTGRES_URL;
debug_1.default.enable(NAMESPACE_PREFIX);
const log = debug_1.default(NAMESPACE_PREFIX);
exports.log = log;
[
    'POSTGRES_URL'
].forEach(key => {
    if (!process.env[key]) {
        log(`⚠️ env var: ${key} not defined`);
        process.exit(0);
    }
});
if (!USER_INPUT) {
    log('Path of migration folder required, example: pgsm /sql/migrations');
    process.exit(0);
}
const USER_MIGRATIONS_PATH = path.join(process.cwd(), USER_INPUT);
exports.USER_MIGRATIONS_PATH = USER_MIGRATIONS_PATH;
try {
    fs.accessSync(USER_MIGRATIONS_PATH);
}
catch (err) {
    log(`⚠️  No migrations folder found, check that path is correct: ${USER_MIGRATIONS_PATH}`);
    process.exit(0);
}
const fsAsync = fs.promises;
exports.fsAsync = fsAsync;
//# sourceMappingURL=config.js.map