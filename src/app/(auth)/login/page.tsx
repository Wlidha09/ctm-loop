
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useAuth, useFirestore, useGoogleProvider } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const googleProvider = useGoogleProvider()

  const isConfigured = !!auth && !!db && !!googleProvider

  const handleGoogleLogin = async () => {
    if (!auth || !db || !googleProvider) return

    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user profile exists
      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)

      if (!profileSnap.exists()) {
        // Create initial profile for new user
        await setDoc(profileRef, {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          displayName: user.displayName,
          photoURL: user.photoURL, // Default avatar from Google
          onboarded: false,
          role: 'Employee', // Default role
          createdAt: serverTimestamp(),
        }, { merge: true })
      }

      toast({
        title: "Connexion réussie",
        description: `Ravi de vous revoir, ${user.displayName || 'utilisateur'}.`,
      })
      
      // Navigate to dashboard - AuthGuard will handle onboarding redirection if needed
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Auth Error:", error)
      toast({
        title: "Erreur d'authentification",
        description: error.message || "Impossible de se connecter avec Google.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <ShieldCheck className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">CTM Loop</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre espace RH & Paie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {!isConfigured && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuration manquante</AlertTitle>
              <AlertDescription>
                Firebase n'est pas encore configuré. Veuillez vérifier vos variables d'environnement.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            className="w-full h-12 text-base font-medium transition-all hover:scale-[1.02] shadow-lg shadow-primary/10" 
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading || !isConfigured}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.61z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Se connecter avec Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8 text-center">
          <p className="text-xs text-muted-foreground px-4">
            En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
