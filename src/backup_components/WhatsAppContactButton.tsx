'use client';
import { useState } from 'react';

interface Seller {
  id: string;
  full_name: string;
  phone: string;
  status: string;
}

export default function WhatsAppContactButton({ seller }: { seller: Seller }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateToken() {
    setLoading(true);
    try {
      const res = await fetch('/api/security-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: seller.id,
          buyer_id: 'USER_ID_ICI',
        }),
      });
      const data = await res.json();
      setToken(data.token);
    } finally {
      setLoading(false);
    }
  }

  const whatsappUrl = `https://wa.me/${seller.phone}?text=${encodeURIComponent(
    `Bonjour, je vous contacte via AbidjanDeals.${token ? ` Mon code de sécurité : ${token}` : ''}`
  )}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-3 rounded-xl transition-colors w-full justify-center"
      >
        Contacter sur WhatsApp
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-xl">

            <div className="flex items-center gap-3 mb-5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-lg">
                OK
              </div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                  {seller.full_name}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Identité certifiée conforme par AbidjanDeals via Didit
                </p>
              </div>
            </div>

            <div className="mb-5 bg-amber-50 dark:bg-amber-950 border border-amber-200 rounded-xl p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-1">
                Rappel de sécurité
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                AbidjanDeals ne gère pas les paiements. Effectuez toujours la transaction en personne.
              </p>
            </div>

            <div className="mb-6">
              {token ? (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Votre code de sécurité</p>
                  <p className="text-2xl font-mono font-bold tracking-widest text-zinc-900 dark:text-zinc-100">
                    {token}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Demandez ce code au vendeur dès l'ouverture de la conversation
                  </p>
                </div>
              ) : (
                <button
                  onClick={generateToken}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-4 text-sm text-zinc-600 dark:text-zinc-400 hover:border-zinc-500 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Génération...' : 'Générer mon code de sécurité'}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium text-center transition-colors"
              >
                Ouvrir WhatsApp
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
}