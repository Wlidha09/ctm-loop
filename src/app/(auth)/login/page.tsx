"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useAuth, useFirestore, useGoogleProvider } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Simple Inline Icons to replace lucide-react in problematic areas
const IconShield = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const IconAlert = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const IconLoader = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const googleProvider = useGoogleProvider()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!auth || !db || !mounted) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard")
      } else {
        setLoading(false)
      }
    })

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          setLoading(true)
          const user = result.user
          const profileRef = doc(db, "profiles", user.uid)
          const profileSnap = await getDoc(profileRef)
          
          if (!profileSnap.exists()) {
            await setDoc(profileRef, {
              uid: user.uid,
              email: user.email,
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              displayName: user.displayName,
              photoURL: user.photoURL,
              onboarded: false,
              role: 'Employee',
              createdAt: serverTimestamp(),
            }, { merge: true })
          }

          toast({
            title: "Connexion réussie",
            description: `Bienvenue, ${user.displayName || 'utilisateur'}.`,
          })
          router.push("/dashboard")
        }
      } catch (error: any) {
        console.error("Redirect Result Error:", error)
        toast({
          title: "Erreur de connexion",
          description: error.message || "Impossible de finaliser la connexion.",
          variant: "destructive"
        })
        setLoading(false)
      }
    }

    handleRedirectResult()
    return () => unsubscribe()
  }, [auth, db, mounted, router])

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) return
    setLoading(true)
    try {
      await signInWithRedirect(auth, googleProvider)
    } catch (error: any) {
      console.error("Auth Error:", error)
      setLoading(false)
      toast({
        title: "Erreur d'authentification",
        description: error.message || "Impossible de lancer la connexion.",
        variant: "destructive"
      })
    }
  }

  if (!mounted) return null

  const isConfigured = !!auth && !!db && !!googleProvider

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <IconShield className="h-10 w-10 text-primary-foreground" />
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
              <IconAlert className="h-4 w-4" />
              <AlertTitle>Configuration manquante</AlertTitle>
              <AlertDescription>
                Firebase n'est pas encore initialisé. Vérifiez vos variables d'environnement.
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
              <IconLoader className="mr-2 h-5 w-5" />
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