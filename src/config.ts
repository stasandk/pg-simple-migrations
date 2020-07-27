import * as path from 'path'
import * as fs from 'fs'
import debug from 'debug'

// INI CONSTANT VARIABLES
const USER_INPUT = process.argv[2]
const NAMESPACE_PREFIX = 'postgres-simple-migrations'

// GET ENVIRONMENT VARIABLES
const { POSTGRES_URL, NODE_ENV } = process.env

// CREATE LOGGER
debug.enable(NAMESPACE_PREFIX)
const log = debug(NAMESPACE_PREFIX)

// CHECK IF ENV VARIABLES ARE SET
;[
  'POSTGRES_URL'
].forEach(key => {
  if (!process.env[key]) {
    log(`⚠️ env var: ${key} not defined`)
    process.exit(0)
  }
})

// CHECK THAT USER HAS PROVIDED HIS MIGRATION PATH
if (!USER_INPUT) {
  log('Path of migration folder required, example: pgsm /sql/migrations')
  process.exit(0)
}

// MAKE SURE THE PROVIDED PATH EXISTS
const USER_MIGRATIONS_PATH = path.join(process.cwd(), USER_INPUT)
try {
  fs.accessSync(USER_MIGRATIONS_PATH)
} catch (err) {
  log(`⚠️  No migrations folder found, check that path is correct: ${USER_MIGRATIONS_PATH}`)
  process.exit(0)
}

// Async fs
const fsAsync = fs.promises

export {
  log,
  USER_MIGRATIONS_PATH,
  fsAsync,

  // Env
  POSTGRES_URL,
  NODE_ENV
}
