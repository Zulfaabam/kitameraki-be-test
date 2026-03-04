import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../../repositories/taskRepository'
import { TaskFilters, TaskStatus } from '../../models/task'

import { handleApiError } from '../../lib/errorHandler'

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const organizationId = request.query.get('organizationId')
    const page = parseInt(request.query.get('page') ?? '1')
    const pageSize = parseInt(request.query.get('pageSize') ?? '10')

    const filters: TaskFilters = {
      search: request.query.get('search') ?? undefined,
      status: (request.query.get('status') as TaskStatus) ?? undefined,
      priority: request.query.get('priority') ?? undefined,
      dueDate: request.query.get('dueDate') ?? undefined,
    }

    if (!organizationId) {
      return { status: 400, body: 'Missing organizationId query parameter' }
    }

    const { resources: tasks, total } = await taskRepository.listByOrganization(
      organizationId,
      page,
      pageSize,
      filters,
    )

    const totalPages = Math.ceil(total / pageSize)

    return {
      jsonBody: {
        data: tasks.map(({ customFields, ...task }) => task),
        total,
        page,
        pageSize,
        totalPages,
      },
      status: 200,
    }
  } catch (error) {
    return handleApiError(error, context, 'Error fetching tasks')
  }
}

app.http('GetTasks', {
  methods: ['GET'],
  authLevel: 'function',
  handler: GetTasks,
})
