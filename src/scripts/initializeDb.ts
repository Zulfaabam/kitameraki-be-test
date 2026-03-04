import { CosmosClient } from '@azure/cosmos'
import * as fs from 'fs'
import * as path from 'path'

async function initialize() {
  console.log('Reading local.settings.json...')
  const settingsPath = path.join(process.cwd(), 'local.settings.json')

  if (!fs.existsSync(settingsPath)) {
    console.error('Error: local.settings.json not found in root directory.')
    process.exit(1)
  }

  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
  const connectionString = settings.Values?.CosmosDbConnectionString

  if (!connectionString) {
    console.error(
      'Error: CosmosDbConnectionString not found in local.settings.json',
    )
    process.exit(1)
  }

  // Bypass SSL verification for the local Cosmos DB Emulator
  if (
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1')
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    console.log('Detected local emulator. SSL verification disabled.')
  }

  const client = new CosmosClient(connectionString)
  const databaseId = 'TaskApp'
  const tasksContainerId = 'Tasks'
  const settingsContainerId = 'Settings'

  console.log(`Ensuring database "${databaseId}" exists...`)
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  })
  console.log(`Database "${databaseId}" is ready.`)

  console.log(
    `Ensuring container "${tasksContainerId}" exists with partition key "/organizationId"...`,
  )
  await database.containers.createIfNotExists({
    id: tasksContainerId,
    partitionKey: { paths: ['/organizationId'] },
  })
  console.log(`Container "${tasksContainerId}" is ready.`)

  console.log(
    `Ensuring container "${settingsContainerId}" exists with partition key "/organizationId"...`,
  )
  await database.containers.createIfNotExists({
    id: settingsContainerId,
    partitionKey: { paths: ['/organizationId'] },
  })
  console.log(`Container "${settingsContainerId}" is ready.`)

  console.log('Database initialization completed successfully.')
}

initialize().catch((error) => {
  console.error('Error during database initialization:', error)
  process.exit(1)
})
