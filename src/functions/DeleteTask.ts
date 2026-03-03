import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../repositories/taskRepository'

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
    context.error(`Error deleting task ${request.query.get('id')}:`, error)
    return {
      status: 500,
      body: 'Internal Server Error',
    }
  }
}

app.http('DeleteTask', {
  methods: ['DELETE'],
  authLevel: 'function',
  handler: DeleteTask,
})
