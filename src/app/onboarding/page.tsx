
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle, Loader2, Calendar, Layout } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { UserRole, UserProfile } from "@/types/auth"

export default function OnboardingPage() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [formData, setFormData] = useState({
    department: "",
    birthDate: "",
    officeDays: "3",
    role: "Employee" as UserRole,
  })
  const [isReadOnly, setIsReadOnly] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    const checkStatus = async () => {
      if (!user || !db) return
      const snap = await getDoc(doc(db, "profiles", user.uid))
      if (snap.exists()) {
        const data = snap.data() as UserProfile
        if (data.onboarded) {
          // If already onboarded, we lock the fields for the employee
          if (data.role === 'Employee') {
            setIsReadOnly(true)
            setFormData({
              department: data.department || "",
              birthDate: data.birthDate || "",
              officeDays: String(data.officeDaysPerWeek || "3"),
              role: data.role,
            })
          }
        }
      }
      setFetchingProfile(false)
    }

    if (user) checkStatus()
  }, [user, authLoading, router, db])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db || isReadOnly) return
    
    setLoading(true)
    try {
      const profileRef = doc(db, "profiles", user.uid)
      await updateDoc(profileRef, {
        department: formData.department,
        birthDate: formData.birthDate,
        role: formData.role,
        officeDaysPerWeek: parseInt(formData.officeDays),
        onboarded: true,
      })

      toast({
        title: "Profil configuré !",
        description: "Bienvenue sur CTM Loop.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de finaliser l'onboarding.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || fetchingProfile) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <div className="bg-primary/10 p-4 rounded-full">
               <UserCircle className="h-12 w-12 text-primary" />
             </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Complétez votre profil</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? "Vos informations de profil sont désormais en lecture seule. Contactez les RH pour toute modification."
              : "Ces informations sont nécessaires pour la gestion de votre dossier employé."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <div className="relative">
                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="department" 
                  className="pl-10"
                  placeholder="Ex: Ressources Humaines, IT, Finance" 
                  required 
                  disabled={isReadOnly}
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="birthDate" 
                    type="date"
                    className="pl-10"
                    required 
                    disabled={isReadOnly}
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeDays">Jours au bureau / semaine</Label>
                <Select 
                  disabled={isReadOnly}
                  value={formData.officeDays} 
                  onValueChange={(v) => setFormData({...formData, officeDays: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre de jours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 jour</SelectItem>
                    <SelectItem value="2">2 jours</SelectItem>
                    <SelectItem value="3">3 jours</SelectItem>
                    <SelectItem value="4">4 jours</SelectItem>
                    <SelectItem value="5">5 jours (Temps plein)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isReadOnly && (
              <div className="space-y-2">
                <Label htmlFor="role">Rôle initial</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owner">Owner (Gérant)</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Dev">Dev (Invisibilité active)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">
                  Note : Le rôle 'Dev' est filtré dans tous les compteurs et listes publiques.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!isReadOnly ? (
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-semibold shadow-lg shadow-primary/20" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Finaliser mon profil
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="outline"
                className="w-full py-6 text-lg font-semibold"
                onClick={() => router.push("/dashboard")}
              >
                Accéder au Dashboard
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
