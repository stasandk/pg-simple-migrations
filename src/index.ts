import { log } from './config'
import runSetup from './setup'
import runMigrations from './migrations'
import client from './tools/postgres'

const run = async () => {
  try {
    await runSetup()
    await runMigrations()
  } catch (err) {
    log(err)
  } finally {
    await client.end()
  }
}
run()

// Handle events with no error listener
process.on('uncaughtException', async (err) => {
  log('whoops! There was an uncaught error', err)
  process.exit(1)
})

// Handle Node.js Errors when Using Promises
process.on('unhandledRejection', function (reason, promise) {
  log('Unhandled rejection', { reason: reason, promise: promise })
})
