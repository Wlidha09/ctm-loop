
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, useFirestore } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { ShieldCheck } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const auth = useAuth()
  const db = useFirestore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!auth || !db || !mounted) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Unprotected routes like landing page don't need redirect
        if (pathname !== "/" && !pathname.startsWith("/login")) {
          router.push("/login")
        }
        setLoading(false)
        return
      }

      try {
        // Check and create profile if missing
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
          
          // New users always go to onboarding
          router.push("/onboarding")
        } else {
          const profileData = profileSnap.data()
          if (!profileData.onboarded && pathname !== "/onboarding") {
            router.push("/onboarding")
          }
        }
      } catch (error) {
        console.error("AuthGuard error:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [auth, db, mounted, pathname, router])

  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20" />
          <div className="relative bg-primary p-4 rounded-2xl shadow-2xl shadow-primary/40 animate-pulse">
            <ShieldCheck className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        <p className="mt-8 text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">
          Vérification de l'authentification...
        </p>
      </div>
    )
  }

  return <>{children}</>
}
