export type TaskStatus = 'todo' | 'in-progress' | 'completed'

export interface Task {
  id: string
  organizationId: string
  title: string
  description?: string
  dueDate?: string | null
  priority?: 'low' | 'medium' | 'high'
  status: TaskStatus
  tags?: string[]
}

export interface TaskFilters {
  search?: string
  status?: TaskStatus
  priority?: string
  dueDate?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
