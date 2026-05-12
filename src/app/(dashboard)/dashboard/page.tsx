
"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
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
  AlertCircle
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activePresence: 0,
    pendingLeave: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) return

      const profileSnap = await getDoc(doc(db, "profiles", user.uid))
      if (profileSnap.exists()) {
        const p = profileSnap.data() as UserProfile
        setProfile(p)

        // If HR/Owner, fetch aggregate stats (excluding 'Dev' role as per Shadow Dev Policy)
        if (['Owner', 'RH', 'Manager'].includes(p.role)) {
          const empQuery = query(
            collection(db, "profiles"), 
            where("companyId", "==", p.companyId),
            where("role", "!=", "Dev")
          )
          const empSnap = await getDocs(empQuery)
          setStats({
            totalEmployees: empSnap.size,
            activePresence: Math.floor(empSnap.size * 0.7), // Mocked for now
            pendingLeave: 3
          })
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    )
  }

  const isAdmin = profile?.role === 'Owner' || profile?.role === 'RH'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Bonjour, {profile?.firstName}</h1>
        <p className="text-muted-foreground">Voici l'aperçu de votre espace CTM Hub pour aujourd'hui.</p>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <>
            <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Effectif Total</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalEmployees}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-accent hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Au bureau</p>
                    <p className="text-3xl font-bold mt-1">{stats.activePresence}</p>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-lg"><Clock className="h-5 w-5 text-accent" /></div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solde Congés</p>
                <p className="text-3xl font-bold mt-1">14.5j</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="h-5 w-5 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tickets Resto</p>
                <p className="text-3xl font-bold mt-1">22</p>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg"><Wallet className="h-5 w-5 text-accent" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Presence Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-bold">Planning de Présence</CardTitle>
              <CardDescription>Semaine du {format(new Date(), 'dd MMMM', { locale: fr })}</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Modifier
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
             <div className="flex justify-between gap-2 py-4">
                {['L', 'M', 'M', 'J', 'V'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-semibold text-muted-foreground">{day}</span>
                    <div className={cn(
                      "w-full h-12 rounded-lg border-2 flex items-center justify-center transition-all",
                      i < (profile?.officeDaysPerWeek || 3) ? "bg-accent/10 border-accent text-accent font-bold" : "bg-muted/50 border-transparent text-muted-foreground"
                    )}>
                      {i < (profile?.officeDaysPerWeek || 3) ? "Bur." : "Tél."}
                    </div>
                  </div>
                ))}
             </div>
             <p className="text-xs text-muted-foreground mt-2 italic flex items-center gap-1">
               <AlertCircle className="h-3 w-3" />
               Le planning bascule automatiquement chaque lundi matin.
             </p>
          </CardContent>
        </Card>

        {/* Info / Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Ma Carrière</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center p-3 rounded-lg border bg-secondary/20">
              <Briefcase className="h-5 w-5 mr-3 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{profile?.department}</p>
                <p className="text-xs text-muted-foreground">Département actuel</p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg border bg-secondary/20">
              <Wallet className="h-5 w-5 mr-3 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{profile?.baseSalary ? `${profile.baseSalary} DT` : 'Non défini'}</p>
                <p className="text-xs text-muted-foreground">Salaire de base (Mensuel)</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary">Détails</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
