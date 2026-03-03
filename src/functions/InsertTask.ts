import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import * as crypto from 'crypto'
import { taskRepository } from '../repositories/taskRepository'
import { Task } from '../models/task'
import { validate } from '../lib/validation'

export async function InsertTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as Task

    // Automatically generate ID if not provided
    if (!body.id) {
      body.id = crypto.randomUUID()
    }

    // Populate default values for optional properties
    if (body.description === undefined) body.description = ''
    if (body.dueDate === undefined) body.dueDate = null
    if (body.priority === undefined) body.priority = 'medium'
    if (body.tags === undefined) body.tags = []

    const { valid, errors } = validate(body)
    if (!valid) {
      return { jsonBody: { errors }, status: 400 }
    }

    const createdTask = await taskRepository.create(body)

    return { jsonBody: createdTask, status: 201 }
  } catch (error) {
    context.error('Error inserting task:', error)
    return {
      status: 500,
      body: 'Internal Server Error',
    }
  }
}

app.http('InsertTask', {
  methods: ['POST'],
  authLevel: 'function',
  handler: InsertTask,
})
