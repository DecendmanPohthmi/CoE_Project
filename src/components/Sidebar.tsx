import { 
  Inbox, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle2, 
  Tag, 
  Plus, 
  ArrowUpRight, 
  X,
  LogOut,
  LogIn
} from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { ViewFilter, Category, Task } from '@/types/todo'
import { useAuth } from '@/context/AuthContext'

interface SidebarProps {
  currentView: ViewFilter
  selectedCategory: Category | 'All'
  tasks: Task[]
  mobileOpen: boolean
  onCloseMobile: () => void
  onSelectView: (view: ViewFilter) => void
  onSelectCategory: (category: Category | 'All') => void
  onOpenNewTaskModal: () => void
  onOpenAuthModal?: () => void
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General']

export function Sidebar({
  currentView,
  selectedCategory,
  tasks,
  mobileOpen,
  onCloseMobile,
  onSelectView,
  onSelectCategory,
  onOpenNewTaskModal,
  onOpenAuthModal,
}: SidebarProps) {
  const { user, logout } = useAuth()

  const counts = {
    all: tasks.length,
    today: tasks.filter((t) => {
      const todayStr = new Date().toISOString().split('T')[0]
      return !t.completed && t.dueDate === todayStr
    }).length,
    upcoming: tasks.filter((t) => {
      const todayStr = new Date().toISOString().split('T')[0]
      return !t.completed && t.dueDate && t.dueDate > todayStr
    }).length,
    important: tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length,
    completed: tasks.filter((t) => t.completed).length,
  }

  const categoryCounts: Record<string, number> = {}
  CATEGORIES.forEach((cat) => {
    categoryCounts[cat] = tasks.filter((t) => t.category === cat).length
  })

  const navItems = [
    { id: 'all' as ViewFilter, label: 'All tasks', icon: Inbox, count: counts.all },
    { id: 'today' as ViewFilter, label: 'Today', icon: Calendar, count: counts.today },
    { id: 'upcoming' as ViewFilter, label: 'Upcoming', icon: Clock, count: counts.upcoming },
    { id: 'important' as ViewFilter, label: 'Important', icon: Star, count: counts.important },
    { id: 'completed' as ViewFilter, label: 'Completed', icon: CheckCircle2, count: counts.completed },
  ]

  const handleNavClick = (view: ViewFilter) => {
    onSelectView(view)
    onCloseMobile()
  }

  const handleCategoryClick = (cat: Category | 'All') => {
    onSelectCategory(cat)
    onCloseMobile()
  }

  const content = (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="space-y-6">
        {/* Header / Logo in Sidebar */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="MyTodo logo" className="h-7 w-7 rounded-md object-contain" />
            <span className="font-brand text-xl font-medium tracking-tight text-foreground">
              My<span className="font-bold">Todo</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand ml-0.5" />
            </span>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="md:hidden rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The one solid main action on the screen per ChaiUI rules */}
        <div>
          <button
            type="button"
            onClick={() => {
              onOpenNewTaskModal()
              onCloseMobile()
            }}
            className="btn-asym w-full inline-flex h-9 items-center justify-center gap-2 bg-neutral-900 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            <span>New task</span>
            <ArrowUpRight className="-ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Views Navigation */}
        <nav className="space-y-1">
          <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            Views
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id && selectedCategory === 'All'
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border border-border/80 bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="rounded px-1.5 py-0.5 text-xs text-muted-foreground">
                  {item.count}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Categories Section */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Categories
            </p>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => handleCategoryClick('All')}
                className="text-[11px] text-muted-foreground hover:text-foreground underline decoration-dotted"
              >
                Reset
              </button>
            )}
          </div>

          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            const count = categoryCounts[cat] || 0
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border border-border/80 bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground/70" />
                  <span>{cat}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer User Profile & Cloud Storage status */}
      <div className="pt-4 border-t border-border/60 space-y-3">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud sync active</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sign in to sync across devices.</p>
            <button
              type="button"
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal()
                onCloseMobile()
              }}
              className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in with account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 border-r border-border/70 bg-card/30 backdrop-blur-md">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full border-r border-border bg-card shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  )
}
