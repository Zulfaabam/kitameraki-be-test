export interface Task {
  id: string
  organizationId: string
  title: string
  description?: string
  dueDate?: string | null
  priority?: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'completed'
  tags?: string[]
}
