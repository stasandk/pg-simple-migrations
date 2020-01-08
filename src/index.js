// Import Postgres db
import { Pool } from 'pg'
import path from 'path'
import * as utils from './utils'

process.on('uncaughtException', (err) => {
  console.error(err)
})

process.on('unhandledRejection', (err) => {
  console.error(err)
})

// Default pg values
const defaultConnection = {
  host: '127.0.0.1',
  user: 'postgres',
  database: 'postgres',
  password: '',
  port: 5432
}

export class PGSM {
  constructor ({ connection, migrationsDir }) {
    // Check migrationsDir is present
    if (!migrationsDir) throw new Error('Migrations folder not found')

    // Postgres connection
    this.connection = connection || defaultConnection

    // Find user migrations folder
    this.migrationsTableSqlPath = path.join(__dirname, '/sql/migrations.sql')
    this.localMigrationsPath = path.join(__dirname.split('/node_modules/')[0].slice(1), '../', migrationsDir || './')
    this.localMigrations = []
    this.dbMigrations = []

    // Ini postgres database
    this.pg = new Pool(this.connection)
  }

  // Insert migration table to the database
  async insertMigrationsTable () {
    try {
      const sqlFile = await utils.readFile(this.migrationsTableSqlPath)
      await this.pg.query(sqlFile)
    } catch (err) {
      throw new Error(err)
    }
  }

  // Get database migrations data (filename, checksum)
  async getDbMigrations () {
    const query = `
      SELECT filename, checksum
      FROM migrations`
    const data = await this.pg.query(query)
    return data.rows
  }

  // Get local migration files
  async getLocalMigrations () {
    const localMigrations = await utils.getFiles(this.localMigrationsPath)
    if (localMigrations.length <= 0) throw new Error('No files found in \'migrations\' folder')

    return Promise.all(localMigrations.map(async filename => {
      // Check local file
      if (filename.split('_').length > 2) throw new Error(`${filename} incorrect filename (Max 1 underscore allowed)`)

      // Build file params
      const fileContent = await utils.readFile(`${this.localMigrationsPath}/${filename}`)
      const checksum = await utils.getChecksum(fileContent)
      const filePath = this.localMigrationsPath + '/' + filename
      return { filename, fileContent, checksum, filePath }
    }))
  }

  // Commit local migration to database
  async updateFilename ({ filePath }) {
    const filename = filePath.split('/').pop()
    let newFilename = filename
    let newFilePath = filePath

    // If filename dont have 'timestamp_<name>.sql' rename
    if (!filename.includes('_')) {
      newFilename = `${utils.getUtc()}_${filename}`
      newFilePath = filePath.replace(filename, newFilename)
      await utils.rename(filePath, newFilePath)
    }

    return { filePath: newFilePath, filename: newFilename }
  }

  async proccessMigrations ({ localMigrations, dbMigrations }) {
    const client = await this.pg.connect()
    try {
      await client.query('BEGIN')

      localMigrations.forEach(async localMigration => {
        const filename = localMigration.filename
        const checksum = localMigration.checksum
        const filePath = localMigration.filePath
        const fileContent = localMigration.fileContent

        // Find localMigration in databaseMigration
        const dbMigration = dbMigrations.filter(migration => migration.filename === filename)[0]

        // Local migration found in database migration
        if (dbMigration) {
          // Compare checksum
          if (dbMigration.checksum !== checksum) throw new Error(`${filename} migration has been applied previously and its content has changed`)
        } else {
          // Commit local migration to db
          const { filename } = await this.updateFilename({ filePath })

          // Commit sql file migrations
          await client.query(fileContent)

          // Update migrations table
          const query = `
            INSERT INTO migrations (filename, checksum)
            VALUES ('${filename}','${checksum}')`
          await client.query(query)
        }
      })

      await client.query('COMMIT')
      console.log('Migrations created succesfully!')
    } catch (err) {
      await client.query('ROLLBACK')
      throw new Error(err)
    } finally {
      client.release()
    }
  }

  async up () {
    await this.insertMigrationsTable()
    const dbMigrations = await this.getDbMigrations()
    const localMigrations = await this.getLocalMigrations()

    await this.proccessMigrations({ localMigrations, dbMigrations })
  }
}
