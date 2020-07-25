import * as crypto from 'crypto'
import client from './tools/postgres'
import { log, fsAsync, USER_MIGRATIONS_PATH } from './config'
import { Migration } from './interfaces'

// Checksum
const genChecksum = (str) => {
  return crypto
    .createHash('md5')
    .update(str, 'utf8')
    .digest('hex')
}

// Apply new migrations
const migrateLocalFiles = async (localFilenames: string[]) => {
  if (localFilenames.length === 0)
    throw 'Not found new .sql local migrations files, skipping migration..'

  for (const filename of localFilenames) {
    try {
      await client.query('BEGIN')
      log(`Attempting to migrate ${filename}`)

      const fileContent = await fsAsync.readFile(USER_MIGRATIONS_PATH + `/${filename}`, 'utf8')
      const fileChecksum = genChecksum(fileContent)
      await client.query(fileContent)

      const query = `
        INSERT INTO _migrations (filename, checksum)
        VALUES ('${filename}','${fileChecksum}') 
      `
      await client.query(query)

      await client.query('COMMIT')
      log(`${filename} successfully migrated`)
    } catch (err) {
      log(`Error migrating ${filename}`)
      await client.query('ROLLBACK')
      throw err
    }
  }
}

// Get all database migrations
const getDbMigrations = async (): Promise<Migration[]> => {
  const query = `
    SELECT *
    FROM _migrations
  `
  const { rows } = await client.query(query)
  return rows
}

export default async () => {
  // Local migrations
  const localFiles = await fsAsync.readdir(USER_MIGRATIONS_PATH)
  
  // Database migrations
  const dbMigrations = await getDbMigrations()

  // Check consistency of local migrations
  for (const dbMigration of dbMigrations) {
    if (!localFiles.includes(dbMigration.filename))
      throw new Error(`Inconsistency found. Missing local migration: ${dbMigration.filename}. Recover migration file or delete it from database`) 

    const fileContent = await fsAsync.readFile(USER_MIGRATIONS_PATH + `/${dbMigration.filename}`, 'utf8')
    if(dbMigration.checksum !== genChecksum(fileContent))
      throw new Error(`Inconsistency found. Local file ${dbMigration.filename} has been modified. Return file to it's original state before continuing`)
  }

  // Select local files to migrate
  const dbMigrationFiles = dbMigrations.map(migration => migration.filename)
  const filesToMigrate = localFiles.filter(file => !dbMigrationFiles.includes(file))
  await migrateLocalFiles(filesToMigrate)
}
