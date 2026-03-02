import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../repositories/taskRepository'

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const organizationId = request.query.get('organizationId')

  if (!organizationId) {
    return { status: 400, body: 'Missing organizationId query parameter' }
  }

  const tasks = await taskRepository.listByOrganization(organizationId)

  return { jsonBody: tasks, status: 200 }
}

app.http('GetTasks', {
  methods: ['GET'],
  authLevel: 'function',
  handler: GetTasks,
})
