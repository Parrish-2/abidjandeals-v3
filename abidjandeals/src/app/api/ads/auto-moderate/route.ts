import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Seuil de confiance à partir duquel une annonce est publiée automatiquement.
// Le rejet, lui, n'est JAMAIS automatique — il reste toujours soumis à validation humaine.
const CONFIDENCE_THRESHOLD = 90
const MAX_IMAGES_ANALYZED = 4

export const maxDuration = 60

export async function POST(req: NextRequest) {
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let adId: string | undefined
    try {
        const body = await req.json()
        adId = body?.adId
    } catch {
        return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }
    if (!adId) return NextResponse.json({ error: 'adId requis' }, { status: 400 })

    const { data: ad } = await adminSupabase
        .from('ads')
        .select('id, user_id, title, description, price, category_id, city, images, status')
        .eq('id', adId)
        .single()

    if (!ad) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

    // Si l'annonce n'est plus en attente (déjà traitée manuellement entre-temps), on ne fait rien.
    if (ad.status !== 'pending') {
        return NextResponse.json({ success: true, skipped: true, reason: 'not_pending' })
    }

    const imageUrls = (ad.images ?? []).slice(0, MAX_IMAGES_ANALYZED)

    const textPrompt = `Tu es un modérateur expert pour Kivoo, un marketplace ivoirien (Côte d'Ivoire).

Analyse cette annonce et retourne UNIQUEMENT un JSON valide, sans texte avant ou après.

Annonce :
- Titre : ${ad.title}
- Description : ${ad.description ?? 'Non fournie'}
- Prix : ${ad.price} FCFA
- Catégorie : ${ad.category_id}
- Ville : ${ad.city}

${imageUrls.length > 0
            ? `${imageUrls.length} photo(s) jointe(s) (sur ${ad.images?.length ?? 0} au total). Vérifie que CHAQUE photo correspond bien au produit décrit dans le titre et la description — pas seulement la première. Vérifie aussi si ce sont de vraies photos du produit ou des images catalogue/stock.`
            : "Aucune image fournie."}

Critères d'évaluation :
1. Contenu interdit (armes, drogues, contenus adultes hors catégorie, fausses CNI)
2. Arnaque potentielle (prix anormalement bas, description vague, offres trop belles)
3. Mauvaise catégorie
4. Cohérence entre les photos et le produit décrit (titre + description)
5. Photos catalogue/stock vs vraies photos
6. Informations insuffisantes
7. Prix cohérent avec le marché ivoirien

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
        const messages: any[] = []
        if (imageUrls.length > 0) {
            const content: any[] = imageUrls.map((url: string) => ({
                type: 'image',
                source: { type: 'url', url },
            }))
            content.push({ type: 'text', text: textPrompt })
            messages.push({ role: 'user', content })
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
            console.error('[auto-moderate] Claude API error:', err)
            // Échec silencieux : l'annonce reste en pending, modération manuelle prendra le relais.
            return NextResponse.json({ success: false, error: 'ai_error' })
        }

        const claudeData = await response.json()
        const rawText = claudeData.content?.[0]?.text ?? ''

        let analysis
        try {
            const clean = rawText.replace(/```json|```/g, '').trim()
            analysis = JSON.parse(clean)
        } catch {
            console.error('[auto-moderate] Parse error:', rawText)
            return NextResponse.json({ success: false, error: 'invalid_ai_response' })
        }

        // ── Auto-approbation uniquement — le rejet reste TOUJOURS manuel ──
        if (analysis.decision === 'approve' && analysis.confidence >= CONFIDENCE_THRESHOLD) {
            const { error: updateError, data: updated } = await adminSupabase
                .from('ads')
                .update({ status: 'active' })
                .eq('id', adId)
                .eq('status', 'pending') // évite une course avec une modération manuelle simultanée
                .select('id')

            if (updateError) {
                console.error('[auto-moderate] update error:', updateError)
                return NextResponse.json({ success: false, error: 'db_update_failed' })
            }

            if (updated && updated.length > 0) {
                await adminSupabase.from('notifications').insert({
                    user_id: ad.user_id,
                    type: 'ad_auto_approved',
                    title: 'Annonce publiée !',
                    message: `Votre annonce "${ad.title}" a été vérifiée et publiée automatiquement.`,
                    ad_id: adId,
                    read: false,
                })

                return NextResponse.json({ success: true, autoApproved: true, analysis })
            }
        }

        // Rejet, incertitude, ou confiance insuffisante → reste en attente pour modération manuelle.
        return NextResponse.json({ success: true, autoApproved: false, analysis })
    } catch (err) {
        console.error('[auto-moderate]', err)
        return NextResponse.json({ success: false, error: 'server_error' })
    }
}

