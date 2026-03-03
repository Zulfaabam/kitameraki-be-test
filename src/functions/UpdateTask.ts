import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../repositories/taskRepository'
import { Task } from '../models/task'
import { validate } from '../lib/validation'

export async function UpdateTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await request.json()) as Partial<Task>
  const taskId = request.query.get('id')
  const organizationId = request.query.get('organizationId')

  if (!taskId) {
    return { status: 400, body: 'Missing id query parameter' }
  }

  if (!organizationId) {
    return { status: 400, body: 'Missing organizationId query parameter' }
  }

  // For updates, validate against the same schema but allow partial fields
  const { valid, errors } = validate(body)
  if (!valid) {
    // Only return 400 if errors are about types/formats, not about "required" fields missing (since it's a PATCH-like POST update)
    const criticalErrors = errors?.filter((e) => !e.includes('required'))
    if (criticalErrors && criticalErrors.length > 0) {
      return { jsonBody: { errors: criticalErrors }, status: 400 }
    }
  }

  const updatedTask = await taskRepository.update(taskId, organizationId, body)

  return { jsonBody: updatedTask, status: 200 }
}

app.http('UpdateTask', {
  methods: ['PATCH'],
  authLevel: 'function',
  handler: UpdateTask,
})
