import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../repositories/taskRepository'

export async function GetTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const taskId = request.query.get('id')
  const organizationId = request.query.get('organizationId')

  if (!taskId || !organizationId) {
    return { status: 400, body: 'Missing id or organizationId query parameter' }
  }

  const task = await taskRepository.getById(taskId, organizationId)

  if (!task) {
    return { status: 404, body: 'Task not found' }
  }

  return { jsonBody: task, status: 200 }
}

app.http('GetTask', {
  methods: ['GET'],
  authLevel: 'function',
  handler: GetTask,
})
