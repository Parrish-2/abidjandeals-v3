export const dynamic = 'force-dynamic';

import { AdsSection } from '@/components/AdsSection';
import BannerSlot from '@/components/BannerSlot';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
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

        const ads = (data ?? []).map((ad: any) => ({
            ...ad,
            category: ad.category_id ?? ad.category ?? '',
            seller: 'Vendeur',
            img: ad.images?.[0] ?? null,
        }))
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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
                <HeroSection stats={stats} />

                <div className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-4">

                    {/* ── Bannière homepage_top — rotation automatique toutes les 6s ── */}
                    <div className="max-w-4xl mx-auto">
                        <BannerSlot position="homepage_top" />
                    </div>

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
