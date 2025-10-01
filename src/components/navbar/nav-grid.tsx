import { ReactNode } from "react"

interface NavGridProps {
  children: ReactNode
}

export function NavGrid({ children }: NavGridProps) {
  return (
    <div className="grid grid-cols-4 h-20 px-2 relative z-10">
      {children}
    </div>
  )
}
