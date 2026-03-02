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
  const taskId = request.query.get('id')
  const organizationId = request.query.get('organizationId')

  if (!taskId || !organizationId) {
    return { status: 400, body: 'Missing id or organizationId query parameter' }
  }

  await taskRepository.delete(taskId, organizationId)

  return { status: 204 } // 204 No Content is more standard for successful DELETE
}

app.http('DeleteTask', {
  methods: ['DELETE'],
  authLevel: 'function',
  handler: DeleteTask,
})
