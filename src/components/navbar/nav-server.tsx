import { NavContainer } from "./nav-container"
import { NavGrid } from "./nav-grid"
import { NavClient } from "./nav-client"

export function Navigation() {
  return (
    <NavContainer>
      <NavGrid>
        <NavClient />
      </NavGrid>
    </NavContainer>
  )
}
