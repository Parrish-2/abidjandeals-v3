export const dynamic = 'force-dynamic';

import { AdsSection } from '@/components/AdsSection';
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

async function getHomepageBanner() {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll: () => cookieStore.getAll() } }
        )
        const now = new Date().toISOString()
        const { data } = await supabase
            .from('banners')
            .select('id, company_name, image_url, link_url, placement, active, contract_end, click_count')
            .eq('placement', 'homepage_top')
            .eq('active', true)
            .or(`contract_end.is.null,contract_end.gt.${now}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (!data) return null
        return {
            id: data.id,
            company_name: data.company_name ?? '',
            image_url: data.image_url,
            link_url: data.link_url ?? null,
            placement: data.placement,
            active: data.active,
            contract_end: data.contract_end ? new Date(data.contract_end).getTime() : null,
            click_count: data.click_count ?? 0,
            created_at: '',
        }
    } catch {
        return null
    }
}

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page: pageParam } = await searchParams
    const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

    const [stats, { ads, totalPages, total }, banner] = await Promise.all([
        getStats(),
        getAds(currentPage),
        getHomepageBanner(),
    ])

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
                <HeroSection stats={stats} />

                <div className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-4">

                    {/* ── Bannière leaderboard compact (hauteur max ~90px) ── */}
                    {banner && (
                        <div className="max-w-4xl mx-auto">
                            {/* Label pub discret */}
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 pl-0.5">
                                Publicité
                            </p>
                            {/* Hauteur contrainte ~30% de moins qu'avant */}
                            <a
                                href={banner.link_url ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl overflow-hidden border border-gray-100 hover:opacity-95 transition-opacity shadow-sm"
                                style={{ maxHeight: '90px' }}
                            >
                                <img
                                    src={banner.image_url}
                                    alt={banner.company_name}
                                    className="w-full h-full object-cover object-center"
                                    style={{ maxHeight: '90px' }}
                                    loading="lazy"
                                />
                            </a>
                        </div>
                    )}

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
