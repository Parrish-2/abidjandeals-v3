import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Politique de confidentialité — AbidjanDeals',
  description: 'Découvrez comment AbidjanDeals collecte, utilise et protège vos données personnelles.',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="font-sans font-extrabold text-3xl text-gray-900 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : janvier 2026</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="font-bold text-lg text-gray-900 mb-3">1. Données collectées</h2>
            <p>AbidjanDeals collecte les données suivantes lors de votre utilisation de la plateforme :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Informations d'inscription : prénom, nom, adresse email, numéro de téléphone</li>
              <li>Documents d'identité (CNI) dans le cadre de la vérification KYC des vendeurs confirmés</li>
              <li>Données de navigation : pages visitées, recherches effectuées</li>
              <li>Contenu publié : annonces, photos, messages</li>
              <li>Données de paiement traitées par notre partenaire CinetPay</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg text-gray-900 mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Gérer votre compte et vous permettre d'utiliser la plateforme</li>
              <li>Vérifier votre identité dans le cadre du programme vendeur confirmé</li>
              <li>Lutter contre la fraude et les annonces frauduleuses</li>
              <li>Améliorer nos services et personnaliser votre expérience</li>
              <li>Vous envoyer des notifications liées à vos annonces et messages</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg text-gray-900 mb-3">3. Documents KYC</h2>
            <p>
              Les documents d'identité (CNI recto/verso, selfie) collectés dans le cadre de la
              vérification KYC sont stockés de manière chiffrée sur des serveurs sécurisés.
              Ces documents sont utilisés uniquement à des fins de vérification d'identité et
              ne sont jamais partagés avec des tiers sans votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-gray-900 mb-3">4. Partage des données</h2>
            <p>
              AbidjanDeals ne vend jamais vos données personnelles. Vos données peuvent être
              partagées uniquement avec :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nos prestataires techniques (hébergement, paiement) dans le cadre strict de leurs missions</li>
              <li>Les autorités compétentes en cas d'obligation légale</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg text-gray-900 mb-3">5. Vos droits</h2>
            <p>Conformément aux lois en vigueur, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification des informations inexactes</li>
              <li>Droit à la suppression de votre compte et de vos données</li>
              <li>Droit d'opposition au traitement de vos données</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez-nous via notre{' '}
              <a href="/contact" className="text-orange-500 underline hover:text-orange-600">
                page de contact
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-gray-900 mb-3">6. Cookies</h2>
            <p>
              AbidjanDeals utilise des cookies techniques nécessaires au fonctionnement de la
              plateforme (session, préférences de langue). Aucun cookie publicitaire tiers n'est
              utilisé.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg text-gray-900 mb-3">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
              appropriées pour protéger vos données contre tout accès non autorisé, perte ou
              destruction. Toutes les communications avec nos serveurs sont chiffrées via HTTPS.
            </p>
          </section>

          <section className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
            <p className="font-semibold text-orange-700 mb-1">Une question sur vos données ?</p>
            <p className="text-orange-600 text-sm">
              Contactez notre équipe via la{' '}
              <a href="/contact" className="underline font-semibold hover:text-orange-700">
                page de contact
              </a>
              . Nous répondons sous 48h.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
