import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../../repositories/taskRepository'

import { handleApiError } from '../../lib/errorHandler'

export async function BulkDeleteTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as { ids: string[] }
    const organizationId = request.query.get('organizationId')

    if (!organizationId) {
      return {
        status: 400,
        body: 'Missing organizationId query parameter',
      }
    }

    if (!Array.isArray(body.ids)) {
      return {
        status: 400,
        body: 'Request body ids must be an array of task IDs',
      }
    }

    await taskRepository.bulkDelete(body.ids, organizationId)

    return { status: 204 }
  } catch (error) {
    return handleApiError(error, context, 'Error bulk deleting tasks')
  }
}

app.http('BulkDeleteTasks', {
  methods: ['POST'],
  authLevel: 'function',
  handler: BulkDeleteTasks,
})
