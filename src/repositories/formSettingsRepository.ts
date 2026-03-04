import { Container } from '@azure/cosmos'
import {
  getCosmosClient,
  databaseId,
  settingsContainerId,
} from '../lib/cosmosClient'
import { FormSettings } from '../models/formSettings'

export class FormSettingsRepository {
  private _container: Container | null = null

  private get container(): Container {
    if (!this._container) {
      this._container = getCosmosClient()
        .database(databaseId)
        .container(settingsContainerId)
    }
    return this._container
  }

  async getByOrganization(
    organizationId: string,
  ): Promise<FormSettings | null> {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.organizationId = @organizationId',
      parameters: [{ name: '@organizationId', value: organizationId }],
    }
    const { resources } = await this.container.items
      .query<FormSettings>(querySpec)
      .fetchAll()
    return resources[0] ?? null
  }

  async update(settings: FormSettings): Promise<FormSettings> {
    const { resource } =
      await this.container.items.upsert<FormSettings>(settings)
    return resource!
  }
}

export const formSettingsRepository = new FormSettingsRepository()
