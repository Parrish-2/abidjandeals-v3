import { NextRequest, NextResponse } from 'next/server'

// POST /api/translate
// Body: { text: string | string[], target_lang: 'EN' | 'FR' }
export async function POST(req: NextRequest) {
    try {
        const { text, target_lang } = await req.json()

        if (!text || !target_lang) {
            return NextResponse.json({ error: 'Missing text or target_lang' }, { status: 400 })
        }

        const apiKey = process.env.DEEPL_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'DeepL API key not configured' }, { status: 500 })
        }

        // DeepL accepte un tableau de textes en une seule requête
        const texts = Array.isArray(text) ? text : [text]

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: texts,
                target_lang: target_lang.toUpperCase(),
                source_lang: 'FR',
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            console.error('DeepL error:', err)
            return NextResponse.json({ error: 'DeepL translation failed' }, { status: response.status })
        }

        const data = await response.json()
        // Retourne un tableau de textes traduits dans le même ordre
        const translations = data.translations.map((t: any) => t.text)

        return NextResponse.json({
            translations,
            // Raccourci si un seul texte envoyé
            text: translations[0] ?? '',
        })
    } catch (err) {
        console.error('Translate route error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
