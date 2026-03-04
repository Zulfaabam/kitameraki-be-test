import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { formSettingsRepository } from '../../repositories/formSettingsRepository'
import { FormSettings } from '../../models/formSettings'

import { handleApiError } from '../../lib/errorHandler'

export async function UpdateFormSettings(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const settings = (await request.json()) as FormSettings

    if (!settings.organizationId) {
      return {
        status: 400,
        body: 'Missing organizationId',
      }
    }

    if (!settings) {
      return {
        status: 400,
        body: 'Invalid settings object',
      }
    }

    const updatedSettings = await formSettingsRepository.update(settings)

    return {
      jsonBody: updatedSettings,
      status: 200,
    }
  } catch (error) {
    return handleApiError(error, context, 'Error updating form settings')
  }
}

app.http('UpdateFormSettings', {
  methods: ['PUT'],
  authLevel: 'function',
  handler: UpdateFormSettings,
})
