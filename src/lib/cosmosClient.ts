import { CosmosClient } from '@azure/cosmos'

let client: CosmosClient | null = null

export function getCosmosClient(): CosmosClient {
  if (!client) {
    // NOTE: In a real app, this should come from process.env.CosmosDbConnectionString
    const connectionString = 'this is a connection string'
    client = new CosmosClient(connectionString)
  }
  return client
}

export const databaseId = 'TaskApp'
export const containerId = 'Tasks'
