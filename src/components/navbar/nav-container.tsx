import { ReactNode } from "react"

interface NavContainerProps {
  children: ReactNode
}

export function NavContainer({ children }: NavContainerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-xl mx-auto">
      <div 
        className="absolute -top-4 left-0 right-0 h-6 "
      ></div>
      <div 
        className="relative bg-[var(--electric-blue)]/10 backdrop-blur-xl border-t border-[var(--electric-blue)]/20 shadow-2xl max-w-xl mx-auto"
      >
        <div className="relative ">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--electric-blue)]/5 to-transparent rounded-t-3xl"></div>
          {children}
        </div>
      </div>
    </div>
  )
}
