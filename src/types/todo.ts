export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type Category = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'General'

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: Category
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type ViewFilter = 'all' | 'today' | 'upcoming' | 'important' | 'completed'

export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title'
