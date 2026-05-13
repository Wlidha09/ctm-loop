"use client"

import { useEffect, useState } from "react"
import { useFirestore, useUser } from "@/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { UserProfile } from "@/types/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

const IconUsers = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
)

const IconClock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconCalendar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconWallet = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </svg>
)

const IconArrowUpRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [offline, setOffline] = useState(false)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activePresence: 0,
    pendingLeave: 0
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!mounted || !user || !db) return

      try {
        const profileSnap = await getDoc(doc(db, "profiles", user.uid))
        if (profileSnap.exists()) {
          const p = profileSnap.data() as UserProfile
          setProfile(p)

          // Fetch aggregate stats - Filtering Dev role for invisibility rule
          const empQuery = query(
            collection(db, "profiles"), 
            where("role", "!=", "Dev")
          )
          const empSnap = await getDocs(empQuery)
          
          setStats({
            totalEmployees: empSnap.size,
            activePresence: Math.floor(empSnap.size * 0.7), // Mocked logic
            pendingLeave: 3
          })
        }
        setOffline(false)
      } catch (error: any) {
        console.error("Dashboard: Error fetching data:", error)
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          setOffline(true)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, db, mounted])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    )
  }

  const isAdmin = profile?.role === 'Owner' || profile?.role === 'RH' || profile?.role === 'Manager'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {offline && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-4 rounded-xl flex items-center gap-3">
          <IconClock className="h-5 w-5" />
          <p className="text-sm font-medium">Vous êtes hors ligne. Les données affichées peuvent ne pas être à jour.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">Bonjour, {profile?.firstName}</h1>
          <p className="text-muted-foreground mt-1">Voici l'aperçu de votre espace CTM Loop pour aujourd'hui.</p>
        </div>
        {profile?.role === 'Dev' && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full border border-amber-500/20 text-sm font-medium">
            Mode Développeur (Profil Invisible)
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <>
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Effectif Réel</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalEmployees}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl shadow-inner"><IconUsers className="h-6 w-6 text-primary" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Au bureau</p>
                    <p className="text-3xl font-bold mt-2">{stats.activePresence}</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-xl shadow-inner"><IconClock className="h-6 w-6 text-accent" /></div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Solde Congés</p>
                <p className="text-3xl font-bold mt-2">14.5j</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl shadow-inner"><IconCalendar className="h-6 w-6 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tickets Resto</p>
                <p className="text-3xl font-bold mt-2">22</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl shadow-inner"><IconWallet className="h-6 w-6 text-accent" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Planning de Présence</CardTitle>
              <CardDescription>Semaine du {format(new Date(), 'dd MMMM', { locale: fr })}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-4" disabled={offline}>
              Modifier
              <IconArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
             <div className="flex justify-between gap-4 py-4">
                {['L', 'M', 'M', 'J', 'V'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                    <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">{day}</span>
                    <div className={cn(
                      "w-full h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-sm",
                      i < (profile?.officeDaysPerWeek || 3) 
                        ? "bg-accent/10 border-accent text-accent font-bold scale-105 ring-4 ring-accent/5" 
                        : "bg-muted/30 border-dashed border-muted text-muted-foreground hover:border-primary/30"
                    )}>
                      <span className="text-xs uppercase opacity-80">{i < (profile?.officeDaysPerWeek || 3) ? "Bur." : "Tél."}</span>
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}