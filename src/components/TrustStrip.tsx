'use client'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

const TRUST_ITEMS = [
  {
    icon: '✅',
    text: 'Rencontre en lieu public',
    description: 'Voir nos conseils de sécurité',
    action: '/category/all',
    color: 'hover:text-emerald-400',
  },
  {
    icon: '🛡️',
    text: 'Vendeurs certifiés KYC',
    description: 'Voir les vendeurs vérifiés',
    action: '/category/all',
    color: 'hover:text-blue-400',
  },
  {
    icon: '🚫',
    text: 'Zéro paiement à distance',
    description: 'Toujours payer en main propre',
    action: '/category/all',
    color: 'hover:text-red-400',
  },
  {
    icon: '📞',
    text: 'Appel & WhatsApp direct',
    description: 'Contactez les vendeurs',
    action: '/category/all',
    color: 'hover:text-green-400',
  },
  {
    icon: '💬',
    text: 'Messagerie sécurisée',
    description: 'Accéder à vos messages',
    action: '/messages',
    color: 'hover:text-purple-400',
  },
  {
    icon: '🚨',
    text: 'Signalement & modération',
    description: 'Signaler une annonce suspecte',
    action: '/category/all',
    color: 'hover:text-orange-400',
  },
]

export function TrustStrip() {
  const router = useRouter()
  const { user, setAuthModalOpen } = useStore()

  function handleClick(action: string) {
    if (action === '/messages' && !user) {
      setAuthModalOpen(true)
      return
    }
    router.push(action)
  }

  return (
    <div className="bg-dark/95 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-0">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {TRUST_ITEMS.map((item, i) => (
            <button
              key={item.text}
              onClick={() => handleClick(item.action)}
              className={`group relative flex items-center gap-2 whitespace-nowrap text-white/60 text-xs flex-shrink-0 px-4 py-3 transition-all duration-200 ${item.color} hover:bg-white/5 ${i > 0 ? 'border-l border-white/5' : ''}`}
            >
              <span className="text-sm group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-white/10 z-50">
                {item.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
