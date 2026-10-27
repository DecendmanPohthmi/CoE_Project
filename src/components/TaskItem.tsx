import React from 'react'
import { Check, Calendar, Edit3, Trash2, Clock, AlertCircle } from 'lucide-react'
import { Task, Priority } from '@/types/todo'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDeleteRequest: (task: Task) => void
}

const PRIORITY_CONFIG: Record<Priority, { label: string; badgeClass: string }> = {
  urgent: {
    label: 'Urgent',
    badgeClass: 'border-red-500/40 text-red-500 dark:border-red-400/40 dark:text-red-400',
  },
  high: {
    label: 'High',
    badgeClass: 'border-amber-500/40 text-amber-600 dark:border-amber-400/40 dark:text-amber-400',
  },
  medium: {
    label: 'Medium',
    badgeClass: 'border-yellow-500/40 text-yellow-600 dark:border-yellow-400/40 dark:text-yellow-400',
  },
  low: {
    label: 'Low',
    badgeClass: 'border-emerald-500/40 text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-400',
  },
}

export function TaskItem({ task, onToggle, onEdit, onDeleteRequest }: TaskItemProps) {
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate || task.completed) return false
    const today = new Date().toISOString().split('T')[0]
    return task.dueDate < today
  }, [task.dueDate, task.completed])

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tomorrow'
    if (dateStr === yesterday) return 'Yesterday'

    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }
    } catch {}
    return dateStr
  }

  const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

  return (
    <article
      className={`card-chai group relative flex flex-col gap-3 p-4 sm:p-5 transition-all duration-200 ${
        task.completed ? 'opacity-65' : 'hover:border-card-edge-hover'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion checkbox button */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            task.completed
              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-500 dark:border-emerald-400/60 dark:text-emerald-400'
              : 'border-border bg-background/50 hover:border-foreground/50'
          }`}
        >
          {task.completed && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
        </button>

        {/* Task content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h3
              onClick={() => onToggle(task.id)}
              className={`cursor-pointer font-montserrat text-sm sm:text-base font-semibold leading-snug transition-colors ${
                task.completed
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground hover:text-foreground/80'
              }`}
            >
              {task.title}
            </h3>

            {/* Action buttons (mobile and desktop friendly) */}
            <div className="flex items-center gap-1 self-end sm:self-auto sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label="Edit task"
                title="Edit task"
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest(task)}
                aria-label="Delete task"
                title="Delete task"
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-transparent text-muted-foreground transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${
                task.completed ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Badges / meta info */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Priority thin outline badge */}
            <span
              className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${priorityMeta.badgeClass}`}
            >
              {priorityMeta.label}
            </span>

            {/* Category tag */}
            <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              {task.category}
            </span>

            {/* Due date tag */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${
                  isOverdue
                    ? 'border-red-500/40 text-red-500 dark:border-red-400/40 dark:text-red-400'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                {formatDueDate(task.dueDate)}
                {isOverdue && ' (Overdue)'}
              </span>
            )}

            {/* Completed timestamp if available */}
            {task.completed && task.completedAt && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                <Clock className="h-3 w-3" />
                Done
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
