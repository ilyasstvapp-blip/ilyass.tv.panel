"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LiveEventsImportRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/dashboard/events") }, [router])
  return null
}
