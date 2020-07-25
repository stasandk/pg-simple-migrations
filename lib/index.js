"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const setup_1 = __importDefault(require("./setup"));
const migrations_1 = __importDefault(require("./migrations"));
const postgres_1 = __importDefault(require("./tools/postgres"));
const run = async () => {
    try {
        await setup_1.default();
        await migrations_1.default();
    }
    catch (err) {
        config_1.log(err);
    }
    finally {
        await postgres_1.default.end();
    }
};
run();
process.on('uncaughtException', async (err) => {
    config_1.log('whoops! There was an uncaught error', err);
    process.exit(1);
});
process.on('unhandledRejection', function (reason, promise) {
    config_1.log('Unhandled rejection', { reason: reason, promise: promise });
});
//# sourceMappingURL=index.js.map