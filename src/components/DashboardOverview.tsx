import React from 'react'
import { CheckCircle2, AlertTriangle, Layers, CalendarCheck } from 'lucide-react'
import { Task } from '@/types/todo'

interface DashboardOverviewProps {
  tasks: Task[]
}

export function DashboardOverview({ tasks }: DashboardOverviewProps) {
  const stats = React.useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const pending = total - completed
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    const todayStr = new Date().toISOString().split('T')[0]
    const dueToday = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length
    const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length
    const urgentOrHigh = tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length

    return { total, completed, pending, rate, dueToday, overdue, urgentOrHigh }
  }, [tasks])

  return (
    <section className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Tasks */}
        <div className="card-chai p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total tasks</span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold font-montserrat tracking-tight text-foreground">
            {stats.total}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Across all categories
          </p>
        </div>

        {/* Completed Rate */}
        <div className="card-chai p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-montserrat tracking-tight text-foreground">
            {stats.completed}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({stats.rate}%)
            </span>
          </div>
          {/* Neutral progress bar per ChaiUI specifications */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-foreground transition-all duration-500"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </div>

        {/* Due Today */}
        <div className="card-chai p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Due today</span>
            <CalendarCheck className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-montserrat tracking-tight text-foreground">
            {stats.dueToday}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Requires attention today
          </p>
        </div>

        {/* Urgent or Overdue */}
        <div className="card-chai p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Needs focus</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-montserrat tracking-tight text-foreground">
            {stats.urgentOrHigh}
            {stats.overdue > 0 && (
              <span className="ml-1.5 text-xs font-normal text-red-500">
                ({stats.overdue} overdue)
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            High priority items
          </p>
        </div>
      </div>
    </section>
  )
}
