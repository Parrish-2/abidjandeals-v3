import { createSupabaseServer } from '@/lib/supabase-server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ShopActions from './ShopActions'
import ShopHours from './ShopHours'

export default async function BoutiquePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createSupabaseServer()

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`id, boutique_name, boutique_slug, boutique_description,
      logo_url, banner_url, boutique_active,
      shop_phone, shop_whatsapp, shop_facebook, shop_instagram, shop_hours, shop_is_open,
      trust_badge, verified_seller, note, nb_avis`)
        .eq('boutique_slug', slug)
        .eq('boutique_active', true)
        .maybeSingle()

    if (!profile) notFound()

    const { data: sub } = await supabase
        .from('seller_subscriptions')
        .select('plan, expires_at')
        .eq('seller_id', profile.id)
        .maybeSingle()

    const isPro = Boolean(
        sub &&
        ['pro', 'pro_trial', 'business'].includes(sub.plan) &&
        (!sub.expires_at || new Date(sub.expires_at) > new Date())
    )

    const { data: listings } = await supabase
        .from('ads')
        .select('id, title, price, images, city, created_at')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    return (
        <main className="max-w-4xl mx-auto px-4 py-6">

            {profile.banner_url && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <Image
                        src={profile.banner_url}
                        alt="Bannière boutique"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            <div className="flex items-start gap-4 mb-6">
                {profile.logo_url ? (
                    <Image
                        src={profile.logo_url}
                        alt="Logo"
                        width={72}
                        height={72}
                        className="rounded-xl border object-cover shrink-0"
                    />
                ) : (
                    <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-semibold truncate">
                            {profile.boutique_name}
                        </h1>

                        {isPro && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                                ⭐ Pro
                            </span>
                        )}

                        {profile.verified_seller && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                ✓ Vérifié
                            </span>
                        )}

                        <span
                            className={
                                profile.shop_is_open
                                    ? "text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                                    : "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            }
                        >
                            {profile.shop_is_open ? 'Ouvert' : 'Fermé'}
                        </span>
                    </div>

                    {typeof profile.note === 'number' && (
                        <p className="text-sm text-amber-600 mt-1">
                            ★ {profile.note.toFixed(1)} ({profile.nb_avis ?? 0} avis)
                        </p>
                    )}

                    {profile.boutique_description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                            {profile.boutique_description}
                        </p>
                    )}
                </div>
            </div>

            <ShopActions
                sellerId={profile.id}
                whatsapp={profile.shop_whatsapp ?? undefined}
                phone={profile.shop_phone ?? undefined}
                facebook={profile.shop_facebook ?? undefined}
                instagram={profile.shop_instagram ?? undefined}
            />

            {profile.shop_hours && <ShopHours hours={profile.shop_hours as any} />}

            <div className="mt-6">
                <h2 className="text-sm font-medium text-gray-700 mb-3">
                    {listings?.length ?? 0} annonce{(listings?.length ?? 0) > 1 ? 's' : ''}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listings?.map((ad) => (
                        <a
                            key={ad.id}
                            href={`/annonces/${ad.id}`}
                            className="border rounded-xl overflow-hidden hover:shadow-sm transition"
                        >
                            <div className="relative aspect-square bg-gray-100">
                                {ad.images?.[0] && (
                                    <Image
                                        src={ad.images[0]}
                                        alt={ad.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="p-2">
                                <p className="text-xs truncate">{ad.title}</p>
                                <p className="text-sm font-medium">
                                    {ad.price?.toLocaleString()} FCFA
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

        </main>
    )
}
