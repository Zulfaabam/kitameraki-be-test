import { Container, SqlQuerySpec } from '@azure/cosmos'
import { getCosmosClient, databaseId, containerId } from '../lib/cosmosClient'
import { Task, TaskFilters } from '../models/task'

export class TaskRepository {
  private _container: Container | null = null

  private get container(): Container {
    if (!this._container) {
      this._container = getCosmosClient()
        .database(databaseId)
        .container(containerId)
    }
    return this._container
  }

  async getById(id: string, organizationId: string): Promise<Task | null> {
    const { resource } = await this.container
      .item(id, organizationId)
      .read<Task>()
    return resource ?? null
  }

  async listByOrganization(
    organizationId: string,
    page: number = 1,
    pageSize: number = 10,
    filters: TaskFilters = {},
  ): Promise<{ resources: Task[]; total: number }> {
    const offset = (page - 1) * pageSize

    let whereClause = 'WHERE c.organizationId = @organizationId'
    const parameters = [{ name: '@organizationId', value: organizationId }]

    if (filters.status) {
      whereClause += ' AND c.status = @status'
      parameters.push({ name: '@status', value: filters.status })
    }

    if (filters.priority) {
      whereClause += ' AND c.priority = @priority'
      parameters.push({ name: '@priority', value: filters.priority })
    }

    if (filters.dueDate) {
      whereClause += ' AND c.dueDate = @dueDate'
      parameters.push({ name: '@dueDate', value: filters.dueDate })
    }

    if (filters.search) {
      whereClause +=
        ' AND (CONTAINS(c.title, @search) OR CONTAINS(c.description, @search))'
      parameters.push({ name: '@search', value: filters.search })
    }

    // Query for data
    const querySpec: SqlQuerySpec = {
      query: `SELECT * FROM c ${whereClause} OFFSET @offset LIMIT @limit`,
      parameters: [
        ...parameters,
        { name: '@offset', value: offset },
        { name: '@limit', value: pageSize },
      ],
    }
    const { resources } = await this.container.items
      .query<Task>(querySpec)
      .fetchAll()

    // Query for total count
    const countQuerySpec: SqlQuerySpec = {
      query: `SELECT VALUE COUNT(1) FROM c ${whereClause}`,
      parameters: parameters,
    }
    const { resources: countResources } = await this.container.items
      .query<number>(countQuerySpec)
      .fetchAll()

    return { resources, total: countResources[0] }
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
