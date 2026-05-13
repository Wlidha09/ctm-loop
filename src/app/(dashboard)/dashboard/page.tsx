
"use client"

import { useEffect, useState } from "react"
import { useFirestore, useUser } from "@/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { UserProfile } from "@/types/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  Clock,
  Briefcase,
  AlertCircle,
  EyeOff,
  WifiOff
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activePresence: 0,
    pendingLeave: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !db) return

      try {
        const profileSnap = await getDoc(doc(db, "profiles", user.uid))
        if (profileSnap.exists()) {
          const p = profileSnap.data() as UserProfile
          setProfile(p)

          // Fetch aggregate stats
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
  }, [user, db])

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
          <WifiOff className="h-5 w-5" />
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
            <EyeOff className="h-4 w-4" />
            Mode Développeur (Profil Invisible)
          </div>
        )}
      </div>

      {/* Hero Stats */}
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
                  <div className="p-3 bg-primary/10 rounded-xl shadow-inner"><Users className="h-6 w-6 text-primary" /></div>
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
                  <div className="p-3 bg-accent/10 rounded-xl shadow-inner"><Clock className="h-6 w-6 text-accent" /></div>
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
              <div className="p-3 bg-primary/10 rounded-xl shadow-inner"><Calendar className="h-6 w-6 text-primary" /></div>
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
              <div className="p-3 bg-accent/10 rounded-xl shadow-inner"><Wallet className="h-6 w-6 text-accent" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Presence Widget */}
        <Card className="lg:col-span-2 shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Planning de Présence</CardTitle>
              <CardDescription>Semaine du {format(new Date(), 'dd MMMM', { locale: fr })}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-4" disabled={offline}>
              Modifier
              <ArrowUpRight className="ml-2 h-4 w-4" />
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
             <div className="mt-6 p-4 rounded-xl bg-secondary/30 flex items-start gap-3 border border-secondary">
               <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
               <div className="text-sm text-muted-foreground">
                 <p className="font-semibold text-foreground">Rappel Automatique</p>
                 <p>Votre planning de présence se réinitialise chaque lundi. Assurez-vous que vos jours au bureau (actuellement <strong>{profile?.officeDaysPerWeek} jours</strong>) respectent la politique de l'entreprise.</p>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Info / Quick Links */}
        <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Ma Carrière</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center p-4 rounded-2xl border bg-background/50 hover:bg-background transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{profile?.department}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Département</p>
              </div>
            </div>
            <div className="pt-4 border-t border-dashed">
              <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">Liens Rapides</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-xs h-10 border-muted rounded-xl" disabled={offline}>Fiches de Paie</Button>
                <Button variant="outline" className="text-xs h-10 border-muted rounded-xl" disabled={offline}>Contrats</Button>
                <Button variant="outline" className="text-xs h-10 border-muted rounded-xl" disabled={offline}>Formations</Button>
                <Button variant="outline" className="text-xs h-10 border-muted rounded-xl" disabled={offline}>Entretiens</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
