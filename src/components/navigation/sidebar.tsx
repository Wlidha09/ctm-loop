
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck,
  TrendingUp,
  UserCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { UserRole } from "@/types/auth"

interface SidebarProps {
  role?: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()

  const handleLogout = async () => {
    if (!auth) return
    await signOut(auth)
    router.push("/login")
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Présences", href: "/presence", icon: CalendarCheck },
    { name: "Mon Profil", href: "/profile", icon: UserCircle },
  ]

  // Role-based additions
  if (role === "Owner" || role === "RH" || role === "Manager") {
    navItems.splice(1, 0, { name: "Employés", href: "/employees", icon: Users })
  }

  if (role === "Owner" || role === "RH") {
    navItems.splice(2, 0, { name: "Paie & Rapports", href: "/payroll", icon: TrendingUp })
  }

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-md">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">CTM Loop</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5",
                  pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
