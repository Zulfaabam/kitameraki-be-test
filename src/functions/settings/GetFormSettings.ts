import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { formSettingsRepository } from '../../repositories/formSettingsRepository'

import { handleApiError } from '../../lib/errorHandler'

export async function GetFormSettings(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const organizationId = request.query.get('organizationId')

    if (!organizationId) {
      return { status: 400, body: 'Missing organizationId query parameter' }
    }

    const settings =
      await formSettingsRepository.getByOrganization(organizationId)

    if (!settings) {
      // Return default empty settings if not found
      return {
        jsonBody: { fields: [] },
        status: 200,
      }
    }

    return {
      jsonBody: settings,
      status: 200,
    }
  } catch (error) {
    return handleApiError(error, context, 'Error fetching form settings')
  }
}

app.http('GetFormSettings', {
  methods: ['GET'],
  authLevel: 'function',
  handler: GetFormSettings,
})
