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
    client = new CosmosClient(connectionString)
  }
  return client
}

export const databaseId = 'TaskApp'
export const containerId = 'Tasks'
