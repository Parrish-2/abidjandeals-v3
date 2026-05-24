import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Shield, MapPin, Phone, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Sécurité & Conseils — AbidjanDeals',
  description: 'Conseils de sécurité pour acheter et vendre en toute confiance sur AbidjanDeals en Côte d\'Ivoire.',
}

const TIPS = [
  {
    icon: MapPin,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Rencontrez-vous en lieu public',
    desc: "Privilegiez toujours une rencontre dans un endroit fréquenté : centre commercial, commissariat, marché. Évitez les domiciles inconnus, surtout pour les premières transactions.",
  },
  {
    icon: CreditCard,
    color: 'bg-blue-50 text-blue-600',
    title: 'Zéro paiement à distance',
    desc: "Ne payez jamais avant d'avoir vu et inspecté le bien en personne. Aucun vendeur sérieux ne vous demandera un virement, un dépôt Orange Money ou Wave avant la remise du bien.",
  },
  {
    icon: Phone,
    color: 'bg-orange-50 text-orange-600',
    title: 'Vérifiez le vendeur',
    desc: "Privilégiez les vendeurs avec le badge Confirmé ✅ (identité vérifiée KYC). Consultez leurs annonces précédentes et leur note. Méfiez-vous des profils créés récemment.",
  },
  {
    icon: Shield,
    color: 'bg-violet-50 text-violet-600',
    title: 'Inspectez avant d\'acheter',
    desc: "Testez le produit sur place avant tout paiement. Pour les appareils électroniques, vérifiez l'IMEI. Pour les véhicules, demandez un essai et les papiers originaux.",
  },
  {
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    title: 'Signalez les arnaques',
    desc: "Si vous suspectez une arnaque, utilisez le bouton Signaler sur l'annonce. Notre équipe de modération examine chaque signalement sous 24h et bloque les comptes frauduleux.",
  },
  {
    icon: CheckCircle,
    color: 'bg-amber-50 text-amber-600',
    title: 'Utilisez la messagerie interne',
    desc: "Communiquez via la messagerie AbidjanDeals plutôt que par SMS. Cela nous permet de détecter et bloquer les tentatives d'arnaque et conserve un historique de vos échanges.",
  },
]

const RED_FLAGS = [
  "Le prix est anormalement bas par rapport au marché",
  "Le vendeur refuse la rencontre en personne",
  "On vous demande de payer avant de voir le bien",
  "Le vendeur prétexte être à l'étranger ou en voyage",
  "On vous envoie un lien externe suspect",
  "Le vendeur demande vos informations bancaires",
  "Les photos semblent être des images trouvées sur internet",
]

export default function SecuritePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">

        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
              <Shield size={24} className="text-orange-400" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-2xl">Sécurité & Conseils</h1>
              <p className="text-white/60 text-sm">Achetez et vendez en toute confiance</p>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            AbidjanDeals met tout en œuvre pour sécuriser votre expérience. Suivez ces conseils
            pour éviter les arnaques et transacter sereinement partout en Côte d'Ivoire.
          </p>
        </div>

        {/* Conseils */}
        <h2 className="font-bold text-xl text-gray-900 mb-5">6 règles d'or</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {TIPS.map((tip, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tip.color}`}>
                <tip.icon size={18} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{tip.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>

        {/* Red flags */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="font-bold text-red-700">Signes d'une arnaque potentielle</h2>
          </div>
          <ul className="space-y-2">
            {RED_FLAGS.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                <span className="mt-0.5 text-red-400 flex-shrink-0">✕</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact urgence */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <p className="font-semibold text-orange-700 mb-1">Vous avez été victime d'une arnaque ?</p>
          <p className="text-orange-600 text-sm mb-3">
            Signalez l'annonce directement depuis la plateforme ou contactez-nous immédiatement.
            Nous bloquerons le compte et coopérerons avec les autorités si nécessaire.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Signaler un problème →
          </a>
        </div>

      </main>
      <Footer />
    </div>
  )
}
