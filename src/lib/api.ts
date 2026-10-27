import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Task, Priority, Category } from '@/types/todo'
import { LoginCredentials, RegisterCredentials, User } from '@/types/auth'
import { supabase } from '@/lib/supabase'

// ---------- Auth ----------

export function toAppUser(u: SupabaseUser): User {
  const metaName = (u.user_metadata?.name as string | undefined) ?? ''
  return {
    id: u.id,
    name: metaName || (u.email ?? '').split('@')[0],
    email: u.email ?? '',
  }
}

export const authApi = {
  async register({ name, email, password }: RegisterCredentials): Promise<User | null> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
    })
    if (error) throw new Error(error.message)

    // When "Confirm email" is enabled in Supabase there is no session yet
    if (!data.session || !data.user) return null
    return toAppUser(data.user)
  },

  async login({ email, password }: LoginCredentials): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw new Error(error.message)
    return toAppUser(data.user)
  },

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getSession()
    return data.session?.user ? toAppUser(data.session.user) : null
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },
}

// ---------- Tasks ----------

export interface TaskInput {
  title: string
  description?: string
  priority: Priority
  category: Category
  dueDate?: string
  completed?: boolean
}

interface TaskRow {
  id: string
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: Category
  due_date: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  }
}

function toRowUpdates(input: Partial<TaskInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (input.title !== undefined) row.title = input.title.trim()
  if (input.description !== undefined) row.description = input.description.trim()
  if (input.priority !== undefined) row.priority = input.priority
  if (input.category !== undefined) row.category = input.category
  if (input.dueDate !== undefined) row.due_date = input.dueDate
  if (input.completed !== undefined) {
    row.completed = input.completed
    row.completed_at = input.completed ? new Date().toISOString() : null
  }
  return row
}

export const taskApi = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as TaskRow[]).map(fromRow)
  },

  async create(task: TaskInput): Promise<Task> {
    // user_id is filled in by the database default (auth.uid())
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...toRowUpdates(task), completed: false, completed_at: null })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return fromRow(data as TaskRow)
  },

  async update(id: string, updates: Partial<TaskInput>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(toRowUpdates(updates))
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return fromRow(data as TaskRow)
  },

  async toggle(id: string): Promise<Task> {
    const { data: current, error: readError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .single()
    if (readError) throw new Error(readError.message)

    return taskApi.update(id, { completed: !current.completed })
  },

  async delete(id: string): Promise<{ id: string }> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { id }
  },
}
