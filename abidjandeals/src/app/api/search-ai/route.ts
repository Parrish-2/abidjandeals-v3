// src/app/api/search-ai/route.ts
import { NextRequest, NextResponse } from 'next/server'

// ── Détecte si une requête nécessite l'IA ────────────────────────────────────
function isComplexQuery(query: string): boolean {
    const words = query.trim().split(/\s+/)
    if (words.length <= 2) return false

    // Requêtes simples = nom de produit/marque connue
    const simplePatterns = [
        /^(iphone|samsung|toyota|honda|mercedes|bmw|audi|huawei|xiaomi|tecno|infinix)\s/i,
        /^\d+/,  // commence par un chiffre
    ]
    for (const p of simplePatterns) {
        if (p.test(query)) return false
    }

    // Indicateurs de requête complexe
    const complexIndicators = [
        'cherche', 'recherche', 'besoin', 'voudrais', 'veux', 'trouve',
        'pas cher', 'bon marché', 'budget', 'moins de', 'entre',
        'familial', 'spacieux', 'récent', 'neuf', 'occasion',
        'urgent', 'rapide', 'livraison',
        'à cocody', 'à abidjan', 'à yopougon', 'à marcory', 'à plateau',
    ]
    const lower = query.toLowerCase()
    return complexIndicators.some(ind => lower.includes(ind))
}

export async function POST(req: NextRequest) {
    try {
        const { query, city } = await req.json()

        if (!query?.trim()) {
            return NextResponse.json({ error: 'Requête manquante' }, { status: 400 })
        }

        // ── Si requête simple, pas besoin d'IA ───────────────────────────────────
        if (!isComplexQuery(query)) {
            return NextResponse.json({
                useAI: false,
                keywords: query,
                filters: {},
            })
        }

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
        }

        // ── Appel Claude Haiku pour extraire les critères ─────────────────────────
        const prompt = `Tu es un assistant pour Kivoo, un marketplace ivoirien (Côte d'Ivoire). 
L'utilisateur cherche : "${query}"${city ? ` (ville actuelle: ${city})` : ''}

Extrais les critères de recherche et retourne UNIQUEMENT ce JSON (sans texte avant ou après) :
{
  "keywords": "mots-clés principaux pour la recherche texte",
  "category": "cat_auto|cat_immo|cat_tech|cat_mode|cat_maison|cat_serv|cat_sport|cat_autres|null",
  "city": "Abidjan|Bouaké|Yamoussoukro|San-Pédro|Daloa|Korhogo|Man|Gagnoa|null",
  "price_max": number_ou_null,
  "price_min": number_ou_null,
  "condition": "Neuf|Occasion|null",
  "intent": "description courte de ce que cherche l'utilisateur en français (max 10 mots)"
}

Règles :
- Les prix sont en FCFA (1 USD ≈ 600 FCFA)
- "pas cher" pour une voiture = max 5 000 000 FCFA
- "pas cher" pour un téléphone = max 150 000 FCFA
- "récent" ou "neuf" = condition Neuf
- Si la ville n'est pas mentionnée, utilise la ville actuelle si fournie
- keywords doit contenir les termes utiles pour une recherche SQL ilike`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 300,
                messages: [{ role: 'user', content: prompt }],
            }),
        })

        if (!response.ok) {
            console.error('[search-ai] Claude error:', await response.text())
            // Fallback : recherche classique
            return NextResponse.json({ useAI: false, keywords: query, filters: {} })
        }

        const data = await response.json()
        const rawText = data.content?.[0]?.text ?? ''

        let filters
        try {
            const clean = rawText.replace(/```json|```/g, '').trim()
            filters = JSON.parse(clean)
        } catch {
            console.error('[search-ai] Parse error:', rawText)
            return NextResponse.json({ useAI: false, keywords: query, filters: {} })
        }

        return NextResponse.json({
            useAI: true,
            keywords: filters.keywords ?? query,
            filters: {
                category: filters.category ?? null,
                city: filters.city ?? null,
                price_max: filters.price_max ?? null,
                price_min: filters.price_min ?? null,
                condition: filters.condition ?? null,
            },
            intent: filters.intent ?? null,
        })

    } catch (err) {
        console.error('[search-ai]', err)
        // Toujours fallback propre, jamais d'erreur visible
        return NextResponse.json({ useAI: false, keywords: '', filters: {} })
    }
}
