import { CosmosClient } from '@azure/cosmos'

let client: CosmosClient | null = null

export function getCosmosClient(): CosmosClient {
  if (!client) {
    const connectionString = process.env.CosmosDbConnectionString
    if (!connectionString) {
      throw new Error(
        'CosmosDbConnectionString is not defined in environment variables',
      )
    }

    // Bypass SSL verification for the local Cosmos DB Emulator
    if (
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1')
    ) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      console.log('Detected local emulator. SSL verification disabled.')
    }

    client = new CosmosClient(connectionString)
  }
  return client
}

export const databaseId = 'TaskApp'
export const tasksContainerId = 'Tasks'
export const settingsContainerId = 'Settings'
