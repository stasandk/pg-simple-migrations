# pg-simple-migrations

Postgres database simple migrations.

## Install

```
$ npm install pg-simple-migrations
```

## Usage
Set ``POSTGRES_URL`` env variable to connect to postgres instance:
- postgres://postgres:password@localhost:5432/postgres

The command to run the migration is: ``pgsm``. After that command you need to specify the folder path to your migration folder: ``pgsm /migrations``. Use in package.json as independet command or before running the app.

```json

"scripts": {
  "start": "pgsm /migrations && node server.js",
  "migrate": "pgsm /migrations"
},

```
