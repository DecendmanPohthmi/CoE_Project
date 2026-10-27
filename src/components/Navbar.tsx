import { useEffect, useState } from 'react'
import { Menu, Plus, LogOut, LogIn } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { ThemeSwitcher } from './ui/ThemeSwitcher'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  onOpenMobileMenu: () => void
  onOpenNewTaskModal: () => void
  onOpenAuthModal: () => void
}

export function Navbar({ onOpenMobileMenu, onOpenNewTaskModal, onOpenAuthModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-[backdrop-filter,background,border-color] duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        {/* Left: Mobile Menu button + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/60 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex md:hidden items-center gap-2">
            <img src={logoImg} alt="MyTodo logo" className="h-7 w-7 rounded-md object-contain" />
            <span className="font-brand text-lg font-medium tracking-tight text-foreground">
              My<span className="font-bold">Todo</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand ml-0.5" />
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2.5 text-xs text-muted-foreground">
            <img src={logoImg} alt="MyTodo logo" className="h-5 w-5 object-contain" />
            <span>Workspace</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">
              {user ? `${user.name}'s Tasks` : 'Personal tasks'}
            </span>
          </div>
        </div>

        {/* Right: User Status, New Task & Theme Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border/80 bg-card/40 text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-medium text-white dark:bg-neutral-200 dark:text-neutral-900">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate text-foreground font-medium">
                  {user.name}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border/80 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border/80 bg-card/80 px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in</span>
            </button>
          )}

          {/* Mobile + button */}
          {user && (
            <button
              type="button"
              onClick={onOpenNewTaskModal}
              aria-label="Create new task"
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}

          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
