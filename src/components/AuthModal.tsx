import { useState } from 'react'
import { ArrowUpRight, Lock, Mail, User as UserIcon, X, Loader2 } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { useAuth } from '@/context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose?: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { login, register } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (!isLogin && !name.trim()) {
      setErrorMessage('Please enter your name.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    try {
      if (isLogin) {
        await login({ email: email.trim(), password })
      } else {
        await register({ name: name.trim(), email: email.trim(), password })
      }
      if (onClose) onClose()
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrorMessage(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md card-chai border border-border/80 bg-card/95 p-6 sm:p-8 relative shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss button if optional */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border/70 bg-card mb-2">
            <img src={logoImg} alt="MyTodo" className="h-6 w-6 object-contain" />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-montserrat">
            {isLogin ? (
              <>
                Sign in to <span className="highlight">MyTodo</span>
              </>
            ) : (
              <>
                Create your <span className="highlight">workspace</span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isLogin
              ? 'Access your tasks synchronized across all devices in real time.'
              : 'Save your tasks securely in persistent cloud storage.'}
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="auth-name">
                Full name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="auth-email">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="auth-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* ChaiUI Solid Button with Asymmetric Corners */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-asym w-full inline-flex h-10 items-center justify-center gap-2 bg-neutral-900 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                  <ArrowUpRight className="-ml-1 h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <span>{isLogin ? "Don't have an account yet?" : 'Already registered?'} </span>
          <button
            type="button"
            onClick={toggleMode}
            className="text-foreground hover:underline font-medium underline-offset-4 ml-1"
          >
            {isLogin ? 'Create one now' : 'Sign in here'}
          </button>
        </div>
      </div>
    </div>
  )
}
