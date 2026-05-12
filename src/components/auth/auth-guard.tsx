
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (pathname !== "/login" && pathname !== "/") {
          router.push("/login")
        }
        setLoading(false)
        return
      }

      const profileSnap = await getDoc(doc(db, "profiles", user.uid))
      if (profileSnap.exists()) {
        const data = profileSnap.data()
        setProfile(data)
        
        if (!data.onboarded && pathname !== "/onboarding") {
          router.push("/onboarding")
        }
      } else {
        router.push("/onboarding")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, pathname])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
