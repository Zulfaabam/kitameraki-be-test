import { Container, SqlQuerySpec } from '@azure/cosmos'
import { getCosmosClient, databaseId, containerId } from '../lib/cosmosClient'
import { Task } from '../models/task'

export class TaskRepository {
  private container: Container

  constructor() {
    this.container = getCosmosClient()
      .database(databaseId)
      .container(containerId)
  }

  async getById(id: string, organizationId: string): Promise<Task | null> {
    const { resource } = await this.container
      .item(id, organizationId)
      .read<Task>()
    return resource ?? null
  }

  async listByOrganization(organizationId: string): Promise<Task[]> {
    const querySpec: SqlQuerySpec = {
      query: 'SELECT * FROM c WHERE c.organizationId = @organizationId',
      parameters: [{ name: '@organizationId', value: organizationId }],
    }
    const { resources } = await this.container.items
      .query<Task>(querySpec)
      .fetchAll()
    return resources
  }

  async create(task: Task): Promise<Task> {
    const { resource } = await this.container.items.create(task)
    return resource!
  }

  async update(
    id: string,
    organizationId: string,
    updates: Partial<Task>,
  ): Promise<Task> {
    const patchOperations = Object.entries(updates).map(([key, value]) => ({
      op: 'replace' as const,
      path: `/${key}`,
      value,
    }))

    const { resource } = await this.container
      .item(id, organizationId)
      .patch(patchOperations)
    return resource!
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.container.item(id, organizationId).delete()
  }

  async bulkDelete(ids: string[], organizationId: string): Promise<void> {
    // Use Promise.all for truly concurrent deletion
    await Promise.all(ids.map((id) => this.delete(id, organizationId)))
  }
}

export const taskRepository = new TaskRepository()
