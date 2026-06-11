// src/app/api/admin/ai-moderate/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const cookieStore = await cookies()

    // ✅ Auth admin
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (n) => cookieStore.get(n)?.value, set() { }, remove() { } } }
    )
    const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { get: (n) => cookieStore.get(n)?.value, set() { }, remove() { } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: profile } = await adminSupabase
        .from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['admin', 'moderator'].includes(profile.role))
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const { adId } = await req.json()
    if (!adId) return NextResponse.json({ error: 'adId requis' }, { status: 400 })

    // ✅ Récupérer l'annonce
    const { data: ad } = await adminSupabase
        .from('ads')
        .select('id, title, description, price, category_id, city, images')
        .eq('id', adId)
        .single()

    if (!ad) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

    // ✅ Construire le prompt
    const imageUrl = ad.images?.[0] ?? null

    const textPrompt = `Tu es un modérateur expert pour Kivoo, un marketplace ivoirien (Côte d'Ivoire).

Analyse cette annonce et retourne UNIQUEMENT un JSON valide, sans texte avant ou après.

Annonce :
- Titre : ${ad.title}
- Description : ${ad.description ?? 'Non fournie'}
- Prix : ${ad.price} FCFA
- Catégorie : ${ad.category_id}
- Ville : ${ad.city}

${imageUrl ? "Une image est jointe. Vérifie si c'est une vraie photo du produit ou une image catalogue/stock." : "Aucune image fournie."}

Critères d'évaluation :
1. Contenu interdit (armes, drogues, contenus adultes hors catégorie, fausses CNI)
2. Arnaque potentielle (prix anormalement bas, description vague, offres trop belles)
3. Mauvaise catégorie
4. Photos catalogue/stock vs vraies photos
5. Informations insuffisantes
6. Prix cohérent avec le marché ivoirien

Retourne ce JSON exact :
{
  "decision": "approve" | "reject" | "manual",
  "confidence": 0-100,
  "score": 0-100,
  "reasons": ["raison 1", "raison 2"],
  "rejection_reason": "motif si rejet" | null,
  "message_vendeur": "message si rejet" | null,
  "flags": {
    "prix_suspect": boolean,
    "contenu_interdit": boolean,
    "photo_catalogue": boolean,
    "description_insuffisante": boolean,
    "mauvaise_categorie": boolean
  }
}`

    try {
        // ✅ Appel Claude API avec ou sans image
        const messages: any[] = []

        if (imageUrl) {
            // Avec image — on passe l'URL directement
            messages.push({
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: { type: 'url', url: imageUrl }
                    },
                    { type: 'text', text: textPrompt }
                ]
            })
        } else {
            messages.push({ role: 'user', content: textPrompt })
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY!,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages,
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            console.error('[ai-moderate] Claude API error:', err)
            return NextResponse.json({ error: 'Erreur API Claude' }, { status: 502 })
        }

        const claudeData = await response.json()
        const rawText = claudeData.content?.[0]?.text ?? ''

        // ✅ Parser le JSON retourné par Claude
        let analysis
        try {
            const clean = rawText.replace(/```json|```/g, '').trim()
            analysis = JSON.parse(clean)
        } catch {
            console.error('[ai-moderate] Parse error:', rawText)
            return NextResponse.json({ error: 'Réponse IA invalide', raw: rawText }, { status: 500 })
        }
        return NextResponse.json({ success: true, analysis })

    } catch (err) {
        console.error('[ai-moderate]', err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
