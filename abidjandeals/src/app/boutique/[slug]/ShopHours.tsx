type Hours = Record<string, { open: string, close: string, closed?: boolean }>

const DAYS: { key: keyof Hours, label: string }[] = [
  { key: 'lun', label: 'Lundi' }, { key: 'mar', label: 'Mardi' },
  { key: 'mer', label: 'Mercredi' }, { key: 'jeu', label: 'Jeudi' },
  { key: 'ven', label: 'Vendredi' }, { key: 'sam', label: 'Samedi' },
  { key: 'dim', label: 'Dimanche' },
]

export default function ShopHours({ hours }: { hours: Hours }) {
  return (
    <div className="border rounded-xl p-4 mb-6 text-sm">
      <p className="font-medium mb-2">Horaires</p>
      <div className="space-y-1">
        {DAYS.map(({ key, label }) => {
          const d = hours[key]
          return (
            <div key={key} className="flex justify-between text-gray-600">
              <span>{label}</span>
              <span>{!d || d.closed ? 'Fermé' : `${d.open} – ${d.close}`}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
