import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../../repositories/taskRepository'

import { handleApiError } from '../../lib/errorHandler'

export async function GetTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const taskId = request.query.get('id')
    const organizationId = request.query.get('organizationId')

    if (!taskId || !organizationId) {
      return {
        status: 400,
        body: 'Missing id or organizationId query parameter',
      }
    }

    const task = await taskRepository.getById(taskId, organizationId)

    if (!task) {
      return {
        status: 404,
        jsonBody: {
          code: 'NotFound',
          message: 'Task not found',
        },
      }
    }

    return { jsonBody: task, status: 200 }
  } catch (error) {
    return handleApiError(
      error,
      context,
      `Error fetching task ${request.query.get('id')}`,
    )
  }
}

app.http('GetTask', {
  methods: ['GET'],
  authLevel: 'function',
  handler: GetTask,
})
