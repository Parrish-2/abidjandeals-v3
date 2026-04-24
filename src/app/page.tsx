import { AdsSection } from '@/components/AdsSection'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { Navbar } from '@/components/Navbar'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getStats() {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => cookieStore.getAll() } }
        )
        const [{ count: total }, { count: vendors }] = await Promise.all([
            supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'active').neq('category_id', 'cat_lingerie'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'vendor'),
        ])
        return { total: total ?? 0, vendors: vendors ?? 0 }
    } catch {
        return { total: 0, vendors: 0 }
    }
}

async function getAds() {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => cookieStore.getAll() } }
        )
        const { data } = await supabase
            .from('ads')
            .select('*')
            .eq('status', 'active')
            .neq('category_id', 'cat_lingerie')
            .order('created_at', { ascending: false })
            .limit(8)
        return (data ?? []).map((ad: any) => ({
            ...ad,
            category: ad.category_id ?? ad.category ?? '',
            seller: 'Vendeur',
            img: ad.images?.[0] ?? null,
        }))
    } catch {
        return []
    }
}

export default async function HomePage() {
    const [stats, recentAds] = await Promise.all([getStats(), getAds()])
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
                <HeroSection stats={stats} />
                <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
                    <AdsSection
                        title="Annonces rÃ©centes"
                        ads={recentAds}
                        seeAllHref="/search"
                    />
                </div>
            </main>
            <Footer />
        </div>
    )
}
