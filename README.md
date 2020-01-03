# pg-simple-migrations

Postgres database simple migrations. 

## Install

```
$ npm install pg-simple-migrations
```

## Usage
Create file **runmigration.js**

```js
const PGMigrations = require('pg-simple-migrations')

// Postgres connection details
const connection = {
  host: '127.0.0.1',
  user: 'postgres',
  database: 'postgres',
  password: 'password',
  port: 5432
}

// Folder where are all sql files. (Absolute path)
const migrationsDir = './migrations'

const migrations = new PGMigrations({ connection, migrationsDir })

async function run () {
  await migrations.up()
}

run()
```

### Call this file when you want to migrate to database new .sql file

## Steps
1. Create folder where you will put all .sql migration files (Param: **migrationsDir**)

2. Create .sql file where you sql code will be executed.

3. After success migration to Postgres database the filename will be renamed. It will have the name of the file and date of the migration. If you change the file that have been migrated before it will throw an error.
