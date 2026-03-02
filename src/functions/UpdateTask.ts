import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../repositories/taskRepository'
import { Task } from '../models/task'

export async function UpdateTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await request.json()) as Partial<Task>
  const taskId = request.query.get('id')
  const organizationId = request.query.get('organizationId')

  if (!taskId || !organizationId) {
    return { status: 400, body: 'Missing id or organizationId query parameter' }
  }

  const updatedTask = await taskRepository.update(taskId, organizationId, body)

  return { jsonBody: updatedTask, status: 200 }
}

app.http('UpdateTask', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: UpdateTask,
})
