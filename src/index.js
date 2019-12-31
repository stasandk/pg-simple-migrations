'use strict'

// Import Postgres db
const { Pool } = require('pg')
const path = require('path')
const { readFile, getFiles, getChecksum, rename, now } = require('./utils')

// Default pg values
const defaultConnection = {
  host: '127.0.0.1',
  user: 'postgres',
  database: 'postgres',
  password: '',
  port: 5432
}

module.exports = class Migration {
  constructor ({ connection, migrationsDir }) {
    // Check migrationsDir is present
    if (!migrationsDir) throw new Error('Migrations folder not found')

    // Postgres connection
    this.connection = connection || defaultConnection

    // Find user migrations folder
    this.migrationsTableSqlPath = path.join(__dirname, '/sql/migrations.sql')
    this.localMigrationsPath = path.join(__dirname.split('/node_modules/')[0], migrationsDir || './')
    this.localMigrations = []
    this.dbMigrations = []

    // Ini postgres database
    this.pg = new Pool(this.connection)
  }

  // Insert migration table to the database
  async insertMigrationsTable () {
    try {
      const sqlFile = await readFile(this.migrationsTableSqlPath)
      await this.pg.query(sqlFile)
    } catch (err) {
      throw new Error(err)
    }
  }

  // Get local migration files
  async getLocalMigrations () {
    this.localMigrations = await getFiles(this.localMigrationsPath)
    if (this.localMigrations.length <= 0) throw new Error('No files found in \'migrations\' folder')
  }

  // Get database migrations data (filename, checksum)
  async getDbMigrations () {
    const query = `
      SELECT filename, checksum
      FROM migrations`
    const data = await this.pg.query(query)
    this.dbMigrations = data.rows
  }

  // Commit local migration to database
  async commitLocalMigration ({ filename, checksum }) {
    // If filename dont have 'xx_timestamp.sql' rename
    if (filename.split('_').length === 1) {
      const newFilename = `${filename.replace('.sql', '')}_${now()}.sql`
      await rename(`${this.localMigrationsPath}/${filename}`, `${this.localMigrationsPath}/${newFilename}`)
      filename = newFilename
    }

    const client = await this.pg.connect()
    try {
      await client.query('BEGIN')

      const sqlFile = await readFile(`${this.localMigrationsPath}/${filename}`)
      await client.query(sqlFile)

      const query = `
        INSERT INTO migrations (filename, checksum)
        VALUES ('${filename}','${checksum}')`
      await client.query(query)

      await client.query('COMMIT')
      console.log(`Migrations ${filename} created succesfully!`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw new Error(err)
    } finally {
      client.release()
    }
  }

  // Commit local migrations to db
  async checkMigrations () {
    this.localMigrations.forEach(async filename => {
      // Check local file
      if (filename.split('_').length > 2) throw new Error(`${filename} has wrong filename`)

      // Generate checksum of file
      const checksum = getChecksum(await readFile(`${this.localMigrationsPath}/${filename}`))

      // Find localMigration in databaseMigration
      const dbMigration = this.dbMigrations.filter(migration => migration.filename === filename)[0]

      // Local migration found in database migration
      if (dbMigration) {
        // Compare checksum
        if (dbMigration.checksum !== checksum) throw new Error(`${filename} migration has been applied previously and its content has changed`)
      } else {
        // Commit local migration to db
        await this.commitLocalMigration({ filename, checksum })
      }
    })
  }

  async up () {
    await this.insertMigrationsTable()
    await this.getLocalMigrations()
    await this.getDbMigrations()

    await this.checkMigrations()
  }
}
