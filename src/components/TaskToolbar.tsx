import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Priority, SortOption } from '@/types/todo'

interface TaskToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: 'all' | 'active' | 'completed'
  onStatusFilterChange: (status: 'all' | 'active' | 'completed') => void
  priorityFilter: Priority | 'all'
  onPriorityFilterChange: (p: Priority | 'all') => void
  sortBy: SortOption
  onSortByChange: (sort: SortOption) => void
  totalCount: number
  filteredCount: number
  onResetFilters: () => void
}

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  totalCount,
  filteredCount,
  onResetFilters,
}: TaskToolbarProps) {
  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all'

  return (
    <div className="space-y-3">
      {/* Search and Main Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, description or category..."
            aria-label="Search tasks"
            className="w-full rounded-md border border-input bg-card/60 pl-9 pr-9 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Segmented status filter (ChaiUI recipe: active = bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100) */}
        <div className="flex items-center self-start sm:self-auto overflow-hidden rounded-md border border-border bg-card/80 p-0.5">
          {(['all', 'active', 'completed'] as const).map((status) => {
            const isActive = statusFilter === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange(status)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  isActive
                    ? 'rounded bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100 font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </button>
            )
          })}
        </div>
      </div>

      {/* Secondary Row: Counts, Priority filter, Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="font-semibold text-foreground">{filteredCount}</strong> of{' '}
            <strong className="font-semibold text-foreground">{totalCount}</strong> tasks
          </span>
          {hasActiveFilters && (
            <>
              <span className="hidden sm:inline text-border">|</span>
              <button
                type="button"
                onClick={onResetFilters}
                className="text-yellow-800 dark:text-orange-200 hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value as Priority | 'all')}
              aria-label="Filter by priority"
              className="rounded border border-border bg-card/60 px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              aria-label="Sort tasks"
              className="rounded border border-border bg-card/60 px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Date added</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
