export const dynamic = 'force-dynamic';

import { AdsSection } from '@/components/AdsSection';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import HomepageBanner from '@/components/HomepageBanner';
import { Navbar } from '@/components/Navbar';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAGE_SIZE = 25

async function getStats() {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => cookieStore.getAll() } }
        )
        const [{ count: total }, { count: vendors }] = await Promise.all([
            supabase.from('ads').select('*', { count: 'exact', head: true })
                .eq('status', 'active')
                .neq('category_id', 'cat_lingerie')
                .neq('category_id', 'cat_adulte'),
            supabase.from('profiles').select('*', { count: 'exact', head: true })
                .eq('role', 'vendor'),
        ])
        return { total: total ?? 0, vendors: vendors ?? 0 }
    } catch {
        return { total: 0, vendors: 0 }
    }
}

async function getAds(page: number) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => cookieStore.getAll() } }
        )
        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        const { data, count } = await supabase
            .from('ads')
            .select('*', { count: 'exact' })
            .eq('status', 'active')
            .neq('category_id', 'cat_lingerie')
            .neq('category_id', 'cat_adulte')
            .order('created_at', { ascending: false })
            .range(from, to)

        const NEW_BADGE_HOURS = 48
        const ads = (data ?? []).map((ad: any) => {
            const isNew = ad.created_at
                ? (Date.now() - new Date(ad.created_at).getTime()) < NEW_BADGE_HOURS * 60 * 60 * 1000
                : false
            return {
                ...ad,
                category: ad.category_id ?? ad.category ?? '',
                seller: 'Vendeur',
                img: ad.images?.[0] ?? null,
                badge: isNew ? 'new' : (ad.badge ?? null),
            }
        })
        return { ads, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE), total: count ?? 0 }
    } catch {
        return { ads: [], totalPages: 1, total: 0 }
    }
}

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page: pageParam } = await searchParams
    const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

    const [stats, { ads, totalPages, total }] = await Promise.all([
        getStats(),
        getAds(currentPage),
    ])

    const now = new Date()
    const showIndependenceBanner = now >= new Date('2026-08-06T00:00:00') && now < new Date('2026-08-09T00:00:00')

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            {showIndependenceBanner && (
                <div className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white" style={{ background: "#F97316" }}>
                    Bonne fête de l'Indépendance ! Kivoo vous souhaite une excellente célébration.
                </div>
            )}
            <main className="flex-1">
                <HeroSection stats={stats} />

                <div className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-4">

                    {/* ── Bannière homepage_top — rotation automatique toutes les 6s ── */}
                    <HomepageBanner />

                    {/* ── Annonces + pagination ── */}
                    <AdsSection
                        title="Annonces récentes"
                        ads={ads}
                        seeAllHref="/search"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        total={total}
                    />
                </div>
            </main>
            <Footer />
        </div>
    )
}
