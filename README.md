# pg-simple-migrations

Postgres database simple migrations.

## Install

```
$ npm install pg-simple-migrations
```

## Usage
Set ``DATABASE_URL`` env variable to connect to postgres instance:
- postgres://postgres:password@localhost:5432/postgres

The command to run the migration is: ``pgsm``. After that command you need to specify the folder path to your migration folder: ``pgsm /migrations``. Use in package.json as independet command or before running the app.

```json

"scripts": {
  "start": "pgsm /migrations && node server.js",
  "migrate": "pgsm /migrations"
},

```
## Migrations files
The .sql files inside you migration folder should be named as following:

```
00001-tables.sql
00002-data.sql
```

The migrations will aply in that order, so if you have more that one file to migrate make sure it ordered wit number prefix correctly
