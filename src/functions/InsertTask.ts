import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../repositories/taskRepository'
import { Task } from '../models/task'

export async function InsertTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await request.json()) as Task
  const createdTask = await taskRepository.create(body)

  return { jsonBody: createdTask, status: 201 }
}

app.http('InsertTask', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: InsertTask,
})
