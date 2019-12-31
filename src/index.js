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
    this.migrationsTableSqlPath = './sql/migrations.sql'
    this.localMigrationsPath = path.join(__dirname, migrationsDir || './')
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
      console.log('Migrations table created succesfully!')
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

  // Commit local migrations to db
  checkMigrations () {
    this.localMigrations.forEach(async filename => {
      // Generate checksum of file
      const checksum = getChecksum(readFile(`${this.localMigrationsPath}/${filename}`))

      // Check if exist database migration in local migrations folder
      const dbMigration = this.dbMigrations.filter(migration => migration.filename === filename)

      if (dbMigration) {
        // Compare checksum
        if (dbMigration.checksum !== checksum) throw new Error(`${filename} migration has been applied previously and its content has changed`)
      } else {
        // Commit local migration to db
        await this.commitLocalMigration({ filename, checksum })
      }
    })
  }

  // Commit local migration to database
  async commitLocalMigration ({ filename, checksum }) {
    const newFilename = `${filename.replace('.sql', '')}_${now()}.sql`
    await rename(filename, newFilename)
    filename = newFilename

    const client = await this.pg.connect()

    try {
      await client.query('BEGIN')

      const sqlFile = await readFile(`${this.localMigrationsPath}/${filename}`)
      await client.query(sqlFile)

      const query = `
        INSERT INTO migrations (filename, checksum)
        VALUES (${filename},${checksum})`

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

  async migrate () {
    await this.insertMigrationsTable()
    await this.getLocalMigrations()
    await this.getDbMigrations()

    this.checkMigrations()
    console.log('Done!')
  }
}
