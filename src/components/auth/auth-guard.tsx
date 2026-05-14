"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { ShieldCheck, Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const auth = useAuth()
  const db = useFirestore()
  const [isVerifyingProfile, setIsVerifyingProfile] = useState(false)

  useEffect(() => {
    // Si on charge encore l'état auth, on ne fait rien
    if (loading || !db || !auth) return

    const handleAuthRedirects = async () => {
      const isPublicRoute = pathname === "/" || pathname === "/login"

      if (user === null) {
        // Utilisateur explicitement déconnecté
        if (!isPublicRoute) {
          console.log("AuthGuard: Utilisateur déconnecté, redirection vers /login")
          router.replace("/login")
        }
        return
      }

      if (user) {
        // Utilisateur connecté
        try {
          setIsVerifyingProfile(true)
          
          // Force refresh du token pour éviter les sessions expirées
          await user.getIdToken(true)

          const profileRef = doc(db, "profiles", user.uid)
          const profileSnap = await getDoc(profileRef)
          
          if (!profileSnap.exists()) {
            console.log("AuthGuard: Création automatique du profil manquant pour", user.email)
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
            
            router.replace("/onboarding")
          } else {
            const profileData = profileSnap.data()
            if (!profileData.onboarded && pathname !== "/onboarding") {
              router.replace("/onboarding")
            } else if (pathname === "/login" || pathname === "/") {
              // Si connecté et sur login/home, on va au dashboard
              router.replace("/dashboard")
            }
          }
        } catch (error) {
          console.error("AuthGuard verification error:", error)
        } finally {
          setIsVerifyingProfile(false)
        }
      }
    }

    handleAuthRedirects()
  }, [user, loading, db, auth, pathname, router])

  // Écran de chargement complet si l'état est undefined (chargement Firebase) ou si on vérifie le profil Firestore
  if (loading || isVerifyingProfile) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20" />
          <div className="relative bg-primary p-4 rounded-2xl shadow-2xl shadow-primary/40 animate-pulse">
            <ShieldCheck className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase animate-pulse">
            Vérification de la session CTM Loop...
          </p>
          <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
