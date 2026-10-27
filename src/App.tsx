import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, CheckCheck, Inbox, ArrowUpRight, FilterX, Loader2, Cloud, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react'
import { Task, ViewFilter, Category, Priority, SortOption } from '@/types/todo'
import { taskApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Backdrop } from '@/components/ui/Backdrop'
import { AnimatedBadge } from '@/components/ui/AnimatedBadge'
import logoImg from '@/assets/logo.png'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { DashboardOverview } from '@/components/DashboardOverview'
import { TaskToolbar } from '@/components/TaskToolbar'
import { TaskItem } from '@/components/TaskItem'
import { TaskModal } from '@/components/TaskModal'
import { AuthModal } from '@/components/AuthModal'
import { Footer } from '@/components/Footer'

export function App() {
  const { user, loading: authLoading } = useAuth()

  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const [currentView, setCurrentView] = useState<ViewFilter>('all')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('dueDate')

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  // Fetch tasks from cloud storage whenever authenticated user changes
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([])
      return
    }

    setTasksLoading(true)
    setTasksError(null)

    try {
      const remoteTasks = await taskApi.getAll()
      setTasks(remoteTasks)
    } catch (err: any) {
      console.error('Failed to load tasks from cloud storage:', err)
      setTasksError(err.message || 'Could not connect to cloud storage to fetch tasks')
    } finally {
      setTasksLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]

    return tasks
      .filter((task) => {
        // View filter
        if (currentView === 'today') {
          if (task.dueDate !== todayStr) return false
        } else if (currentView === 'upcoming') {
          if (!task.dueDate || task.dueDate <= todayStr) return false
        } else if (currentView === 'important') {
          if (task.priority !== 'urgent' && task.priority !== 'high') return false
        } else if (currentView === 'completed') {
          if (!task.completed) return false
        }

        // Category filter
        if (selectedCategory !== 'All' && task.category !== selectedCategory) {
          return false
        }

        // Status filter
        if (statusFilter === 'active' && task.completed) return false
        if (statusFilter === 'completed' && !task.completed) return false

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchTitle = task.title.toLowerCase().includes(q)
          const matchDesc = task.description?.toLowerCase().includes(q)
          const matchCategory = task.category.toLowerCase().includes(q)
          if (!matchTitle && !matchDesc && !matchCategory) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        }
        if (sortBy === 'priority') {
          const priorityWeights: Record<Priority, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          }
          return priorityWeights[b.priority] - priorityWeights[a.priority]
        }
        if (sortBy === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
  }, [tasks, currentView, selectedCategory, statusFilter, priorityFilter, searchQuery, sortBy])

  // Toggle task completion in cloud storage
  const handleToggleTask = async (id: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = !t.completed
          return {
            ...t,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        }
        return t
      })
    )

    try {
      const updated = await taskApi.toggle(id)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err: any) {
      console.error('Failed to toggle task in cloud storage:', err)
      // Revert on failure
      fetchTasks()
    }
  }

  // Save (create or update) task in cloud storage
  const handleSaveTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'> & { id?: string }
  ) => {
    try {
      if (taskData.id) {
        // Edit existing task in cloud storage
        const updated = await taskApi.update(taskData.id, {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          category: taskData.category,
          dueDate: taskData.dueDate,
        })
        setTasks((prev) => prev.map((t) => (t.id === taskData.id ? updated : t)))
      } else {
        // Create new task in cloud storage
        const created = await taskApi.create({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          category: taskData.category,
          dueDate: taskData.dueDate,
        })
        setTasks((prev) => [created, ...prev])
      }
    } catch (err: any) {
      console.error('Failed to save task to cloud storage:', err)
      setTasksError(err.message || 'Failed to save task to cloud storage')
    }
  }

  // Delete task from cloud storage
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return
    const idToDelete = taskToDelete.id

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== idToDelete))
    setTaskToDelete(null)

    try {
      await taskApi.delete(idToDelete)
    } catch (err: any) {
      console.error('Failed to delete task from cloud storage:', err)
      fetchTasks()
    }
  }

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task)
    setIsTaskModalOpen(true)
  }

  const handleOpenNew = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    setTaskToEdit(null)
    setIsTaskModalOpen(true)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setSelectedCategory('All')
    setCurrentView('all')
  }

  const getViewTitle = () => {
    if (selectedCategory !== 'All') return `${selectedCategory} tasks`
    switch (currentView) {
      case 'today':
        return 'Today'
      case 'upcoming':
        return 'Upcoming tasks'
      case 'important':
        return 'Important tasks'
      case 'completed':
        return 'Completed tasks'
      default:
        return 'All tasks'
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-background text-foreground flex flex-col justify-between">
      {/* Ambient background */}
      <Backdrop />

      <div className="flex-1">
        {/* Sticky blur Navbar */}
        <Navbar
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenNewTaskModal={handleOpenNew}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Main Body with Sidebar + Main Content Column with widescreen responsive layout */}
        <div className="flex max-w-[1600px] mx-auto w-full px-2 sm:px-4 lg:px-6">
          {/* Sidebar */}
          <Sidebar
            currentView={currentView}
            selectedCategory={selectedCategory}
            tasks={tasks}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onSelectView={(v) => setCurrentView(v)}
            onSelectCategory={(c) => setSelectedCategory(c)}
            onOpenNewTaskModal={handleOpenNew}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          {/* Main workspace area */}
          <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Header Hero Banner */}
            <div className="space-y-3">
              <AnimatedBadge>
                <img src={logoImg} alt="" className="h-3.5 w-3.5 object-contain" />
                <span>Cloud synced workspace</span>
              </AnimatedBadge>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-montserrat">
                Plan your work with <span className="highlight">deliberate calm</span>.
              </h1>

              <p className="max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                {user
                  ? `Welcome back, ${user.name}. Your personal tasks are securely saved and synced across all your devices.`
                  : 'Sign in to access your cloud-synchronized tasks from any computer, tablet, or phone.'}
              </p>

              {/* Action Buttons row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenNew}
                      className="btn-asym inline-flex h-9 items-center gap-2 bg-neutral-900 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create task</span>
                      <ArrowUpRight className="-ml-1 h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('today')
                        setSelectedCategory('All')
                      }}
                      className="btn-asym-mirror inline-flex h-9 items-center gap-2 border border-border bg-transparent px-4 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <CheckCheck className="h-4 w-4 text-muted-foreground" />
                      <span>View today</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-asym inline-flex h-9 items-center gap-2 bg-neutral-900 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    <span>Sign in / Register</span>
                    <ArrowUpRight className="-ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Error Banner if any */}
            {tasksError && (
              <div className="card-chai flex items-center justify-between p-4 border-destructive/40 bg-destructive/10 text-destructive text-sm">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{tasksError}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchTasks}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4 hover:opacity-80"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            )}

            {/* If user is not authenticated: Show informative callout */}
            {!user && !authLoading && (
              <div className="card-chai p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground font-montserrat">
                    Cross-device synchronization with <span className="highlight">cloud storage</span>
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                    Every task you create is securely saved to your personal cloud database and isolated with end-to-end authentication. Log in to your account from any device to continue right where you left off.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-lg border border-border/70 bg-card/40 space-y-2">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-foreground">Cloud Storage</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Replaces volatile local storage with reliable persistent cloud database storage.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-border/70 bg-card/40 space-y-2">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-foreground">User-Specific Privacy</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Each task belongs only to your user account. Password hashing and JWT protect your data.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-border/70 bg-card/40 space-y-2">
                    <CheckCheck className="h-5 w-5 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-foreground">Seamless Sync</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Instant state updates, category management, due dates, and priority sorting.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-asym inline-flex h-9 items-center gap-2 bg-neutral-900 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    <span>Get started now</span>
                    <ArrowUpRight className="-ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* Authenticated Workspace */}
            {user && (
              <>
                {/* Dashboard Overview Cards */}
                <DashboardOverview tasks={tasks} />

                {/* Task Section */}
                <section className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-medium tracking-tight font-montserrat">
                        {getViewTitle()}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'} in this view
                      </p>
                    </div>

                    {tasksLoading && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Syncing...</span>
                      </div>
                    )}
                  </div>

                  {/* Toolbar: Search, Filters, Sorting */}
                  <TaskToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    priorityFilter={priorityFilter}
                    onPriorityFilterChange={setPriorityFilter}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    totalCount={tasks.length}
                    filteredCount={filteredTasks.length}
                    onResetFilters={handleResetFilters}
                  />

                  {/* Task Cards List */}
                  {tasksLoading && tasks.length === 0 ? (
                    <div className="card-chai flex items-center justify-center p-12 text-center my-6">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading tasks from cloud storage...</span>
                      </div>
                    </div>
                  ) : filteredTasks.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {filteredTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onEdit={handleOpenEdit}
                          onDeleteRequest={setTaskToDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Empty state */
                    <div className="card-chai flex flex-col items-center justify-center p-12 text-center my-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 font-montserrat text-base font-semibold text-foreground">
                        {tasks.length === 0 ? 'No tasks yet' : 'No tasks match criteria'}
                      </h3>
                      <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                        {tasks.length === 0
                          ? 'Your cloud workspace is clear. Create your first task to start organizing your day.'
                          : 'Try modifying your search or clearing applied filters.'}
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        {tasks.length > 0 && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            <FilterX className="h-3.5 w-3.5" />
                            Reset filters
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleOpenNew}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add task
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals & Dialogs */}
      <TaskModal
        open={isTaskModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Delete this task?"
        description={`This will permanently remove "${taskToDelete?.title || 'this task'}" from your account. This action cannot be undone.`}
        confirmLabel="Delete task"
        cancelLabel="Keep task"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  )
}
