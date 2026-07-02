'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function VendeurPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/abonnements')
  }, [router])
  return null
}
