
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, useFirestore } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const auth = useAuth()
  const db = useFirestore()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!auth || !db || !mounted) {
      if (mounted) setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (pathname !== "/login" && pathname !== "/") {
          router.push("/login")
        }
        setLoading(false)
        return
      }

      try {
        const profileSnap = await getDoc(doc(db, "profiles", user.uid))
        if (profileSnap.exists()) {
          const data = profileSnap.data()
          if (!data.onboarded && pathname !== "/onboarding") {
            router.push("/onboarding")
          }
        } else {
          if (pathname !== "/onboarding") {
            router.push("/onboarding")
          }
        }
      } catch (error) {
        console.warn("AuthGuard: Profile fetch failed, potentially offline.", error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, pathname, auth, db, mounted])

  if (!mounted) return null

  if (!auth || !db) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de configuration</AlertTitle>
          <AlertDescription>
            Firebase n'est pas initialisé. Veuillez configurer vos variables d'environnement Firebase.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
