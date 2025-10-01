"use client"

import { usePathname } from "next/navigation"
import { NavItem } from "./nav-item"
import { navigationItems } from "./nav-data"

export function NavClient() {
  const pathname = usePathname()
  
  return (
    <>
      {navigationItems.map((item) => (
        <NavItem
          key={item.name}
          name={item.name}
          href={item.href}
          icon={item.icon}
          isActive={pathname === item.href}
        />
      ))}
    </>
  )
}
