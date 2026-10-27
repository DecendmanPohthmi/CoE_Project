import bg from '@/assets/background.svg'

export function Backdrop() {
  return (
    <img
      src={bg}
      alt=""
      aria-hidden="true"
      className="chai-backdrop"
      fetchPriority="high"
      decoding="async"
    />
  )
}
