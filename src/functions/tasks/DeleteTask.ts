import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../../repositories/taskRepository'

import { handleApiError } from '../../lib/errorHandler'

export async function DeleteTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const taskId = request.query.get('id')
    const organizationId = request.query.get('organizationId')

    if (!taskId) {
      return { status: 400, body: 'Missing id query parameter' }
    }

    if (!organizationId) {
      return { status: 400, body: 'Missing organizationId query parameter' }
    }

    await taskRepository.delete(taskId, organizationId)

    return { status: 204 }
  } catch (error) {
    return handleApiError(
      error,
      context,
      `Error deleting task ${request.query.get('id')}`,
    )
  }
}

app.http('DeleteTask', {
  methods: ['DELETE'],
  authLevel: 'function',
  handler: DeleteTask,
})
