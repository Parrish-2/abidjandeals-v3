// src/app/api/health/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const runtime = 'edge' // réponse ultra-rapide, pas de cold start sur cette route

export async function GET() {
    const start = Date.now()

    try {
        // Ping Supabase pour le maintenir éveillé aussi
        await supabase.from('ads').select('id').limit(1).single()

        return NextResponse.json(
            {
                status: 'ok',
                db: 'ok',
                latency: `${Date.now() - start}ms`,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        )
    } catch {
        // Même si Supabase échoue, on répond OK pour Vercel
        return NextResponse.json(
            {
                status: 'ok',
                db: 'unreachable',
                latency: `${Date.now() - start}ms`,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        )
    }
}