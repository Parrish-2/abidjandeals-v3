'use client'

import { supabase } from '@/lib/supabase'
import { Eye, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
    userId: string
}

interface Stats {
    total: number
    thisWeek: number
    today: number
}

export default function ShopStats({ userId }: Props) {
    const [stats, setStats] = useState<Stats>({ total: 0, thisWeek: 0, today: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchStats = async () => {
            const now = new Date()

            const todayStart = new Date(now)
            todayStart.setHours(0, 0, 0, 0)

            const weekStart = new Date(now)
            weekStart.setDate(weekStart.getDate() - 7)

            const { data, error } = await supabase
                .from('shop_analytics')
                .select('created_at')
                .eq('seller_id', userId)
                .eq('event', 'shop_view')

            if (error || !data) { setLoading(false); return }

            setStats({
                total: data.length,
                today: data.filter(r => new Date(r.created_at) >= todayStart).length,
                thisWeek: data.filter(r => new Date(r.created_at) >= weekStart).length,
            })
            setLoading(false)
        }

        fetchStats()
    }, [userId])

    if (loading) {
        return (
            <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>📊 Statistiques de votre boutique</p>
                </div>
                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 80, background: '#f3f4f6', borderRadius: 10 }} />
                    ))}
                </div>
            </div>
        )
    }

    const cards = [
        { label: 'Vues totales', value: stats.total, icon: <Eye size={16} />, color: '#6366f1' },
        { label: '7 derniers jours', value: stats.thisWeek, icon: <TrendingUp size={16} />, color: '#0ea5e9' },
        { label: "Aujourd'hui", value: stats.today, icon: <Zap size={16} />, color: '#16a34a' },
    ]

    return (
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>📊 Statistiques de votre boutique</p>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {cards.map(({ label, value, icon, color }) => (
                    <div key={label} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, margin: '0 auto 8px' }}>
                            {icon}
                        </div>
                        <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '5px 0 0', lineHeight: 1.3 }}>{label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
