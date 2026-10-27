import { Heart } from 'lucide-react'
import logoImg from '@/assets/logo.png'

export function Footer() {
  return (
    <footer className="relative mt-20 px-4 py-8 font-montserrat sm:px-8 lg:px-12 before:absolute before:top-0 before:left-1/2 before:h-px before:w-full before:max-w-[1600px] before:-translate-x-1/2 before:bg-amber-600 before:opacity-10 before:[mask-image:linear-gradient(90deg,transparent_0%,black_40%,black_60%,transparent_100%)] dark:before:bg-orange-300">
      <div className="mx-auto flex max-w-[1600px] w-full flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="MyTodo logo" className="h-5 w-5 object-contain" />
          <span className="font-semibold text-foreground">MyTodo</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Crafted with</span>
          <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500/20" />
          <span>for focused productivity</span>
        </div>

        <div className="text-muted-foreground/80">
          Cloud synchronized task workspace
        </div>
      </div>
    </footer>
  )
}
