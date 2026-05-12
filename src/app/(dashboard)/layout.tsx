
"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Sidebar } from "@/components/navigation/sidebar"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { UserProfile } from "@/types/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Bell, Search, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser
      if (user) {
        const snap = await getDoc(doc(db, "profiles", user.uid))
        if (snap.exists()) setProfile(snap.data() as UserProfile)
      }
    }
    fetchProfile()
    
    // Check dark mode
    if (document.documentElement.classList.contains('dark')) setIsDark(true)
  }, [])

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar role={profile?.role} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-8 border-b bg-card">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10 bg-secondary/50 border-none h-10 w-full" placeholder="Rechercher..." />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-card" />
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold leading-none">{profile?.firstName} {profile?.lastName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{profile?.role}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-primary/10 text-primary">{profile?.firstName?.[0]}{profile?.lastName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
