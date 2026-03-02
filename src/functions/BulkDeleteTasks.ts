import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../repositories/taskRepository'

export async function BulkDeleteTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await request.json()) as string[]
  const organizationId = request.query.get('organizationId')

  if (!organizationId || !Array.isArray(body)) {
    return {
      status: 400,
      body: 'Missing organizationId query parameter or invalid request body',
    }
  }

  await taskRepository.bulkDelete(body, organizationId)

  return { status: 204 }
}

app.http('BulkDeleteTasks', {
  methods: ['DELETE'],
  authLevel: 'function',
  handler: BulkDeleteTasks,
})
