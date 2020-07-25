"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const postgres_1 = __importDefault(require("./tools/postgres"));
const insertTableMigrationsToDb = async () => {
    try {
        await postgres_1.default.query('BEGIN');
        const query = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id serial PRIMARY KEY,
        filename TEXT UNIQUE,
        checksum TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
        await postgres_1.default.query(query);
        await postgres_1.default.query('COMMIT');
        config_1.log('Migrations table successfully created');
    }
    catch (err) {
        config_1.log('Error creating migrations table');
        await postgres_1.default.query('ROLLBACK');
        throw err;
    }
};
exports.default = async () => {
    const query = `
    SELECT to_regclass('_migrations') as table
  `;
    const { rows } = await postgres_1.default.query(query);
    const table = rows[0].table;
    if (!table) {
        config_1.log('Initializing setup..');
        await insertTableMigrationsToDb();
    }
    else {
        config_1.log('Setup already done, skipping..');
    }
};
//# sourceMappingURL=setup.js.map