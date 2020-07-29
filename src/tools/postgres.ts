import { Client } from 'pg'
import { log, NODE_ENV, DATABASE_URL } from '../config'

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ?
    { rejectUnauthorized: false } :
    false
})

// Open and check correct database connection
client
  .connect()
  .catch(err => log('Database connection error', err.stack))

export default client
