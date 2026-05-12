
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { doc, updateDoc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { UserRole } from "@/types/auth"

export default function OnboardingPage() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    department: "",
    role: "Employé" as UserRole,
    officeDays: "3",
  })
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    try {
      const companyId = formData.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
      
      // Create company if it's new structure (Simplified for MVP)
      const companyRef = doc(db, "companies", companyId)
      await setDoc(companyRef, {
        id: companyId,
        name: formData.companyName,
        createdAt: new Date(),
      })

      const profileRef = doc(db, "profiles", user.uid)
      await updateDoc(profileRef, {
        companyId,
        department: formData.department,
        role: formData.role,
        officeDaysPerWeek: parseInt(formData.officeDays),
        onboarded: true,
      })

      toast({
        title: "Profil configuré !",
        description: "Bienvenue sur CTM Hub.",
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

  if (authLoading || !user) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Complétez votre profil</CardTitle>
          <CardDescription>
            Nous avons besoin de quelques informations pour configurer votre espace de travail.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input 
                id="companyName" 
                placeholder="Ex: CTM Consulting" 
                required 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input 
                  id="department" 
                  placeholder="Ex: RH, IT, Ventes" 
                  required 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle souhaité</Label>
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
                    <SelectItem value="Employé">Employé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeDays">Jours de présence au bureau par semaine</Label>
              <Select 
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
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finaliser l'inscription
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
