import { log } from './config'
import client from './tools/postgres'

// Insert table migrations to database
const insertTableMigrationsToDb = async () => {
  try {
    await client.query('BEGIN')

    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id serial PRIMARY KEY,
        filename TEXT UNIQUE,
        checksum TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await client.query(query)
    await client.query('COMMIT')
    log('Migrations table successfully created')
  } catch (err) {
    log('Error creating migrations table')
    await client.query('ROLLBACK')
    throw err
  }
}

// Check database has migrations table
export default async () => {
  const query = `
    SELECT to_regclass('migrations') as table
  `

  const { rows } = await client.query(query)
  const table = rows[0].table
  if (!table) {
    log('Initializing setup..')
    await insertTableMigrationsToDb()
  } else {
    log('Setup already done, skipping..')
  }
}
