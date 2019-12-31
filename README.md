# pg-simple-migrations

Postgres database simple migrations. 

## Install

```
$ npm install pg-simple-migrations
```

## Usage

```js
const PGMigrations = require('pg-simple-migrations')

const connection = {
  host: '127.0.0.1',
  user: 'postgres',
  database: 'postgres',
  password: 'password',
  port: 5432
}

const migrationsDir = './migrations'

const migrations = new PGMigrations({ connection, migrationsDir })

(async () => {
  await migrations.up()
})()
```
