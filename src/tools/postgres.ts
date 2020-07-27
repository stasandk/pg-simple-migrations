import { Client } from 'pg'
import { log, POSTGRES_URL, NODE_ENV } from '../config'

const client = new Client({
  connectionString: POSTGRES_URL,
  ssl: {
    rejectUnauthorized: NODE_ENV !== 'development'
  }
})

// Open and check correct database connection
client
  .connect()
  .catch(err => log('Database connection error', err.stack))

export default client
