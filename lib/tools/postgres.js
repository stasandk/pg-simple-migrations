"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = require("../config");
const client = new pg_1.Client({
    connectionString: config_1.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
client
    .connect()
    .catch(err => config_1.log('Database connection error', err.stack));
exports.default = client;
//# sourceMappingURL=postgres.js.map