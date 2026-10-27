import { useState, useEffect, useRef } from 'react'
import { X, Calendar, Flag, Tag, FileText } from 'lucide-react'
import { Task, Priority, Category } from '@/types/todo'

interface TaskModalProps {
  open: boolean
  taskToEdit?: Task | null
  onClose: () => void
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'> & { id?: string }) => void
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General']
const PRIORITIES: { value: Priority; label: string; toneClass: string }[] = [
  { value: 'urgent', label: 'Urgent', toneClass: 'border-red-500/40 text-red-500 dark:border-red-400/40 dark:text-red-400' },
  { value: 'high', label: 'High', toneClass: 'border-amber-500/40 text-amber-600 dark:border-amber-400/40 dark:text-amber-400' },
  { value: 'medium', label: 'Medium', toneClass: 'border-yellow-500/40 text-yellow-600 dark:border-yellow-400/40 dark:text-yellow-400' },
  { value: 'low', label: 'Low', toneClass: 'border-emerald-500/40 text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-400' },
]

export function TaskModal({ open, taskToEdit, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState<Category>('Work')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (taskToEdit) {
        setTitle(taskToEdit.title)
        setDescription(taskToEdit.description || '')
        setPriority(taskToEdit.priority)
        setCategory(taskToEdit.category)
        setDueDate(taskToEdit.dueDate || '')
      } else {
        setTitle('')
        setDescription('')
        setPriority('medium')
        setCategory('Work')
        setDueDate(new Date().toISOString().split('T')[0])
      }
      setError('')
      setTimeout(() => titleInputRef.current?.focus(), 50)

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, taskToEdit, onClose])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Please provide a title for the task.')
      titleInputRef.current?.focus()
      return
    }

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id } : {}),
      title: trimmedTitle,
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate || undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-card-edge-hover bg-card p-6 text-foreground shadow-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="task-modal-title" className="font-montserrat text-xl font-semibold">
          {taskToEdit ? 'Edit task' : 'Create new task'}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {taskToEdit
            ? 'Update task parameters and due dates below.'
            : 'Fill in the information below to add a task to your workspace.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-foreground">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. Prepare system design document"
              className="mt-1.5 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, checklist details, or links..."
              className="mt-1.5 w-full resize-none rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Priority & Category grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                Priority
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex items-center justify-center rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? `${p.toneClass} bg-muted/60 ring-1 ring-border`
                          : 'border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="task-category" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Category
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1.5 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label htmlFor="task-duedate" className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Due date
            </label>
            <input
              id="task-duedate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {taskToEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
