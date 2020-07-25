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
const crypto = __importStar(require("crypto"));
const postgres_1 = __importDefault(require("./tools/postgres"));
const config_1 = require("./config");
const genChecksum = (str) => {
    return crypto
        .createHash('md5')
        .update(str, 'utf8')
        .digest('hex');
};
const migrateLocalFiles = async (localFilenames) => {
    if (localFilenames.length === 0)
        throw 'Not found new .sql local migrations files, skipping migration..';
    try {
        await postgres_1.default.query('BEGIN');
        for (const filename of localFilenames) {
            config_1.log(`Attempting to migrate ${filename}`);
            const fileContent = await config_1.fsAsync.readFile(config_1.USER_MIGRATIONS_PATH + `/${filename}`, 'utf8');
            const fileChecksum = genChecksum(fileContent);
            await postgres_1.default.query(fileContent);
            const query = `
        INSERT INTO migrations (filename, checksum)
        VALUES ('${filename}','${fileChecksum}') 
      `;
            await postgres_1.default.query(query);
        }
        await postgres_1.default.query('COMMIT');
        config_1.log('All files successfully migrated');
    }
    catch (err) {
        config_1.log('Error migrating files');
        await postgres_1.default.query('ROLLBACK');
        throw err;
    }
};
const getDbMigrations = async () => {
    const query = `
    SELECT *
    FROM migrations
  `;
    const { rows } = await postgres_1.default.query(query);
    return rows;
};
exports.default = async () => {
    const localFiles = await config_1.fsAsync.readdir(config_1.USER_MIGRATIONS_PATH);
    const dbMigrations = await getDbMigrations();
    for (const dbMigration of dbMigrations) {
        if (!localFiles.includes(dbMigration.filename))
            throw new Error(`Inconsistency found. Missing local migration: ${dbMigration.filename}. Recover migration file or delete it from database`);
        const fileContent = await config_1.fsAsync.readFile(config_1.USER_MIGRATIONS_PATH + `/${dbMigration.filename}`, 'utf8');
        if (dbMigration.checksum !== genChecksum(fileContent))
            throw new Error(`Inconsistency found. Local file ${dbMigration.filename} has been modified. Return file to it's original state before continuing`);
    }
    const dbMigrationFiles = dbMigrations.map(migration => migration.filename);
    const filesToMigrate = localFiles.filter(file => !dbMigrationFiles.includes(file));
    await migrateLocalFiles(filesToMigrate);
};
//# sourceMappingURL=migrations.js.map