import { Home, ArrowLeftRight, History, User } from "lucide-react"

export const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Swap", href: "/swap", icon: ArrowLeftRight },
  { name: "History", href: "/history", icon: History },
  { name: "Profile", href: "/profile", icon: User },
] as const

export type NavItem = typeof navigationItems[number]
