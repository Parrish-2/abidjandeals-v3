import { NextRequest, NextResponse } from 'next/server'

const CATEGORY_LABELS: Record<string, string> = {
    cat_tech: 'Électronique & Téléphonie',
    cat_auto: 'Véhicules',
    cat_immo: 'Immobilier',
    cat_serv: 'Services',
    cat_maison: 'Maison & Jardin',
    cat_mode: 'Mode & Vêtements',
    cat_beaute: 'Beauté & Santé',
    cat_sport: 'Sport & Loisirs',
    cat_adulte: 'Adulte',
}

export async function POST(req: NextRequest) {
    try {
        const { title, description, category } = await req.json()

        if (!title && !description) {
            return NextResponse.json({ error: 'Titre ou description requis' }, { status: 400 })
        }

        const catLabel = CATEGORY_LABELS[category] || 'Divers'

        const prompt = `Tu es un expert en rédaction d'annonces pour le marché ivoirien et ouest-africain (plateforme Kivoo).
Améliore cette annonce de la catégorie "${catLabel}" pour qu'elle soit plus convaincante, claire et optimisée pour les acheteurs locaux.

Titre actuel: ${title || '(non renseigné)'}
Description actuelle: ${description || '(non renseignée)'}

Règles strictes:
- Garde EXACTEMENT les mêmes informations factuelles, n'invente rien
- Titre: max 80 caractères, accrocheur et précis
- Description: max 400 caractères, points clés en premier, ton professionnel mais accessible
- Adapte au contexte ivoirien (FCFA, Abidjan si pertinent, expressions locales naturelles)
- Si le titre ou la description est vide, génère à partir de ce qui est disponible

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks:
{"title": "...", "description": "..."}`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY!,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }],
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            console.error('Anthropic API error:', err)
            return NextResponse.json({ error: 'Erreur API IA' }, { status: 500 })
        }

        const data = await response.json()
        const text = data.content?.[0]?.text || ''

        try {
            const clean = text.replace(/```json|```/g, '').trim()
            const result = JSON.parse(clean)
            if (!result.title && !result.description) throw new Error('empty')
            return NextResponse.json(result)
        } catch {
            return NextResponse.json({ error: 'Réponse IA invalide' }, { status: 500 })
        }
    } catch (e) {
        console.error('improve-listing error:', e)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
