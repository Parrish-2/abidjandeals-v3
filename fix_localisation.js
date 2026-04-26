const fs = require('fs');

const filePath = 'src/app/publier/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ajouter les imports et types de localisation après "type MediaFile"
const oldTypeMediaFile = `type MediaFile = { file: File; url: string; type: 'image' | 'video' }`;
const newTypeMediaFile = `type MediaFile = { file: File; url: string; type: 'image' | 'video' }
type Location = { id: string; name: string; parent_id: string | null }`;

content = content.replace(oldTypeMediaFile, newTypeMediaFile);

// 2. Ajouter les states de localisation après "[loading, setLoading]"
const oldLoadingState = `  const [loading, setLoading] = useState(false)`;
const newLoadingState = `  const [loading, setLoading] = useState(false)
  const [villes, setVilles] = useState<Location[]>([])
  const [communes, setCommunes] = useState<Location[]>([])
  const [sousQuartiers, setSousQuartiers] = useState<Location[]>([])
  const [selectedVilleId, setSelectedVilleId] = useState<string>('')
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>('')`;

content = content.replace(oldLoadingState, newLoadingState);

// 3. Ajouter le useEffect de chargement des villes après le premier useEffect (brouillon)
const oldFirstUseEffect = `  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)`;
const newFirstUseEffect = `  // Charger les villes depuis Supabase
  useEffect(() => {
    async function loadVilles() {
      const { data } = await supabase
        .from('locations')
        .select('id, name, parent_id')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('name')
      if (data) setVilles(data)
    }
    loadVilles()
  }, [])

  // Charger les communes quand une ville est sélectionnée
  useEffect(() => {
    if (!selectedVilleId) { setCommunes([]); setSousQuartiers([]); return }
    async function loadCommunes() {
      const { data } = await supabase
        .from('locations')
        .select('id, name, parent_id')
        .eq('parent_id', selectedVilleId)
        .eq('is_active', true)
        .order('name')
      if (data) setCommunes(data)
      setSousQuartiers([])
      setSelectedCommuneId('')
    }
    loadCommunes()
  }, [selectedVilleId])

  // Charger les sous-quartiers quand une commune est sélectionnée
  useEffect(() => {
    if (!selectedCommuneId) { setSousQuartiers([]); return }
    async function loadSousQuartiers() {
      const { data } = await supabase
        .from('locations')
        .select('id, name, parent_id')
        .eq('parent_id', selectedCommuneId)
        .eq('is_active', true)
        .order('name')
      if (data) setSousQuartiers(data)
    }
    loadSousQuartiers()
  }, [selectedCommuneId])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)`;

content = content.replace(oldFirstUseEffect, newFirstUseEffect);

// 4. Remplacer la section Localisation complète
const oldLocalisation = `              {/* Étape 4 — Localisation */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">4</div>
                  <MapPin size={16} className="text-orange-500" />
                  <h2 className="font-bold text-gray-800">Localisation</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select name="city" value={form.city} onChange={handleChange} required
                    className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                    <option value="">Ville *</option>
                    {CITIES.map(c => { const name = c.replace(/^[^\s]+\\s/, ''); return <option key={name} value={name}>{name}</option> })}
                  </select>

                  {quartiersForCity.length > 0 ? (
                    <select name="quartier" value={form.quartier} onChange={handleChange}
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                      <option value="">Quartier (optionnel)</option>
                      {quartiersForCity.map(q => <option key={q} value={q}>{q}</option>)}
                      <option value="Autre">Autre quartier</option>
                    </select>
                  ) : (
                    <input name="quartier" value={form.quartier} onChange={handleChange}
                      placeholder="Quartier (optionnel)"
                      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                  )}
                </div>
                {form.quartier === 'Autre' && (
                  <input onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))}
                    placeholder="Précisez votre quartier"
                    className="mt-3 w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition" />
                )}
              </div>`;

const newLocalisation = `              {/* Étape 4 — Localisation (3 niveaux dynamiques) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">4</div>
                  <MapPin size={16} className="text-orange-500" />
                  <h2 className="font-bold text-gray-800">Localisation</h2>
                </div>
                <div className="space-y-3">
                  {/* Niveau 1 — Ville */}
                  <select
                    value={selectedVilleId}
                    onChange={e => {
                      const id = e.target.value
                      const ville = villes.find(v => v.id === id)
                      setSelectedVilleId(id)
                      setSelectedCommuneId('')
                      setForm(f => ({ ...f, city: ville?.name || '', quartier: '' }))
                    }}
                    required
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                    <option value="">Ville *</option>
                    {villes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>

                  {/* Niveau 2 — Commune / Quartier */}
                  {communes.length > 0 && (
                    <select
                      value={selectedCommuneId}
                      onChange={e => {
                        const id = e.target.value
                        const commune = communes.find(c => c.id === id)
                        setSelectedCommuneId(id)
                        setForm(f => ({ ...f, quartier: commune?.name || '' }))
                      }}
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                      <option value="">Commune / Quartier (optionnel)</option>
                      {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}

                  {/* Niveau 3 — Sous-quartier */}
                  {sousQuartiers.length > 0 && (
                    <select
                      onChange={e => {
                        const sq = sousQuartiers.find(s => s.id === e.target.value)
                        if (sq) setForm(f => ({ ...f, quartier: sq.name }))
                      }}
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition">
                      <option value="">Sous-quartier (optionnel)</option>
                      {sousQuartiers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}

                  {/* Saisie libre si pas de sous-quartier */}
                  {communes.length === 0 && (
                    <input
                      name="quartier"
                      value={form.quartier}
                      onChange={handleChange}
                      placeholder="Quartier (optionnel)"
                      className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition"
                    />
                  )}
                </div>
              </div>`;

if (content.includes(oldLocalisation)) {
  content = content.replace(oldLocalisation, newLocalisation);
  console.log('✅ Section Localisation remplacée avec succès !');
} else {
  console.log('⚠️  Section Localisation non trouvée — vérifiez manuellement');
}

// 5. Mettre à jour le résumé pour afficher ville + quartier
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fichier sauvegardé avec succès !');
