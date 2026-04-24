'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import {
  Upload, X, CheckCircle, AlertCircle, Loader2,
  Shield, Camera, FileText, ChevronRight, Lock
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'intro' | 'cni-recto' | 'cni-verso' | 'selfie' | 'review' | 'success'
type FaceStatus = 'idle' | 'loading-model' | 'analyzing' | 'detected' | 'not-detected' | 'error'

interface DocFile {
  file: File
  preview: string
  faceStatus?: FaceStatus
  faceMessage?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT STATUT VISAGE
// ─────────────────────────────────────────────────────────────────────────────

function FaceStatusBadge({ status, message }: { status: FaceStatus; message?: string }) {
  if (status === 'idle') return null

  const configs = {
    'loading-model': {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Loader2 size={14} className="text-blue-500 animate-spin" />,
      text: 'text-blue-700',
      label: 'Chargement du modèle IA...',
    },
    'analyzing': {
      bg: 'bg-orange-50 border-orange-200',
      icon: <Loader2 size={14} className="text-orange-500 animate-spin" />,
      text: 'text-orange-700',
      label: 'Analyse du visage en cours...',
    },
    'detected': {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: <CheckCircle size={14} className="text-emerald-500" />,
      text: 'text-emerald-700',
      label: message || 'Visage détecté ✓',
    },
    'not-detected': {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle size={14} className="text-red-500" />,
      text: 'text-red-700',
      label: 'Aucun visage détecté. Assurez-vous d\'être dans un endroit éclairé et que votre visage est bien visible à côté de votre CNI.',
    },
    'error': {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: <AlertCircle size={14} className="text-yellow-500" />,
      text: 'text-yellow-700',
      label: 'Impossible d\'analyser l\'image. Veuillez réessayer.',
    },
  }

  const config = configs[status]
  if (!config) return null

  return (
    <div className={`flex items-start gap-2 border rounded-xl px-3 py-2.5 mt-2 ${config.bg}`}>
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <p className={`text-xs leading-relaxed ${config.text}`}>{config.label}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK — Détection faciale avec face-api.js (chargement asynchrone)
// ─────────────────────────────────────────────────────────────────────────────

let faceApiLoaded = false
let faceApiLoading = false

async function loadFaceApi() {
  if (faceApiLoaded) return true
  if (faceApiLoading) {
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (faceApiLoaded) { clearInterval(interval); resolve() }
      }, 100)
    })
    return true
  }

  faceApiLoading = true
  try {
    const faceapi = await import('@vladmandic/face-api')
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
    faceApiLoaded = true
    faceApiLoading = false
    return true
  } catch (e) {
    faceApiLoading = false
    console.error('face-api load error:', e)
    return false
  }
}

async function detectFaceInImage(imageElement: HTMLImageElement): Promise<boolean | null> {
  try {
    const faceapi = await import('@vladmandic/face-api')
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 })
    const detections = await faceapi.detectAllFaces(imageElement, options)
    return detections.length > 0
  } catch (e) {
    console.error('Face detection error:', e)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

export default function VerificationDocumentsPage() {
  const router = useRouter()
  const { user } = useStore()

  const [ready,   setReady]   = useState(false)
  const [step,    setStep]    = useState<Step>('intro')
  const [loading, setLoading] = useState(false)

  // Fichiers
  const [cniRecto, setCniRecto] = useState<DocFile | null>(null)
  const [cniVerso, setCniVerso] = useState<DocFile | null>(null)
  const [selfie,   setSelfie]   = useState<DocFile | null>(null)

  // Préchargement asynchrone du modèle IA (ne bloque pas la page)
  useEffect(() => {
    loadFaceApi() // Fire and forget — charge en arrière-plan
  }, [])

  // Auth guard
  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true)
      if (!user) router.push('/')
    }, 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (ready && !user) router.push('/')
  }, [user, ready])

  // ── Analyse faciale ────────────────────────────────────────────────────────

  async function analyzeFace(file: File, setter: React.Dispatch<React.SetStateAction<DocFile | null>>) {
    setter(prev => prev ? { ...prev, faceStatus: 'analyzing' } : null)

    const loaded = await loadFaceApi()
    if (!loaded) {
      setter(prev => prev ? { ...prev, faceStatus: 'error' } : null)
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = async () => {
      const hasface = await detectFaceInImage(img)
      URL.revokeObjectURL(url)

      if (hasface === null) {
        setter(prev => prev ? { ...prev, faceStatus: 'error' } : null)
      } else if (hasface) {
        setter(prev => prev ? { ...prev, faceStatus: 'detected' } : null)
      } else {
        setter(prev => prev ? { ...prev, faceStatus: 'not-detected' } : null)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      setter(prev => prev ? { ...prev, faceStatus: 'error' } : null)
    }

    img.src = url
  }

  // ── Sélection fichier ──────────────────────────────────────────────────────

  function handleFileSelect(
    files: FileList | null,
    setter: React.Dispatch<React.SetStateAction<DocFile | null>>,
    requiresFace: boolean = false
  ) {
    if (!files || !files[0]) return
    const file = files[0]

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop lourde (max 10 Mo)')
      return
    }

    const preview = URL.createObjectURL(file)
    const docFile: DocFile = {
      file,
      preview,
      faceStatus: requiresFace ? 'analyzing' : undefined,
    }
    setter(docFile)

    if (requiresFace) {
      analyzeFace(file, setter)
    }
  }

  function removeFile(setter: React.Dispatch<React.SetStateAction<DocFile | null>>, current: DocFile | null) {
    if (current?.preview) URL.revokeObjectURL(current.preview)
    setter(null)
  }

  // ── Upload et soumission ───────────────────────────────────────────────────

  async function handleSubmit() {
    if (!user || !cniRecto || !cniVerso || !selfie) return

    // ✅ Bloquer si le visage n'est pas détecté
    if (selfie.faceStatus === 'not-detected') {
      toast.error('Votre selfie doit montrer clairement votre visage')
      return
    }

    // ✅ Bloquer si l'analyse est encore en cours
    if (selfie.faceStatus === 'analyzing' || selfie.faceStatus === 'loading-model') {
      toast.error('Analyse en cours, patientez quelques secondes')
      return
    }

    setLoading(true)
    try {
      // 1. Upload des 3 fichiers dans Supabase Storage
      const uploadDoc = async (file: File, name: string): Promise<string> => {
        const path = `${user.id}/${Date.now()}-${name}`
        const { error } = await supabase.storage
          .from('identity-docs')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (error) throw new Error(`Upload échoué: ${error.message}`)
        return path
      }

      const [rectoPath, versoPath, selfiePath] = await Promise.all([
        uploadDoc(cniRecto.file, 'cni-recto.jpg'),
        uploadDoc(cniVerso.file, 'cni-verso.jpg'),
        uploadDoc(selfie.file,   'selfie-cni.jpg'),
      ])

      // 2. ✅ Validation côté SERVEUR — plus de mise à jour directe Supabase
      // depuis le client (évite la manipulation des données)
      const res = await fetch('/api/kyc/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cni_recto_path: rectoPath,
          cni_verso_path: versoPath,
          selfie_path:    selfiePath,
          face_detected:  selfie.faceStatus === 'detected',
          face_score:     selfie.faceStatus === 'detected' ? 1 : 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors de la soumission')
        return
      }

      setStep('success')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  // ── Loading guard ──────────────────────────────────────────────────────────

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return null

  // ── Succès ─────────────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Documents reçus !</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              Votre dossier de vérification a été soumis avec succès. Notre équipe va examiner vos documents sous <strong>24 à 48h</strong>.
            </p>
            <p className="text-gray-400 text-xs mb-8">
              Vous recevrez une notification dès que votre compte sera validé.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-emerald-700 mb-2">✅ Ce que vous avez envoyé :</p>
              <ul className="space-y-1 text-xs text-emerald-700">
                <li>• CNI Recto ✓</li>
                <li>• CNI Verso ✓</li>
                <li>• Selfie avec CNI ✓ (visage détecté par IA)</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition-all hover:scale-105"
            >
              Aller au tableau de bord →
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'cni-recto', label: 'CNI Recto',    icon: <FileText size={14} /> },
    { id: 'cni-verso', label: 'CNI Verso',    icon: <FileText size={14} /> },
    { id: 'selfie',    label: 'Selfie + CNI', icon: <Camera size={14} />   },
    { id: 'review',    label: 'Révision',     icon: <CheckCircle size={14} /> },
  ]

  const stepOrder: Step[] = ['intro', 'cni-recto', 'cni-verso', 'selfie', 'review']
  const currentStepIndex = stepOrder.indexOf(step)

  function canProceed(): boolean {
    if (step === 'cni-recto') return !!cniRecto
    if (step === 'cni-verso') return !!cniVerso
    if (step === 'selfie') {
      if (!selfie) return false
      if (selfie.faceStatus === 'analyzing' || selfie.faceStatus === 'loading-model') return false
      if (selfie.faceStatus === 'not-detected') return false
      return true
    }
    if (step === 'review') return !!(cniRecto && cniVerso && selfie)
    return true
  }

  function nextStep() {
    const order: Step[] = ['intro', 'cni-recto', 'cni-verso', 'selfie', 'review']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }

  function prevStep() {
    const order: Step[] = ['intro', 'cni-recto', 'cni-verso', 'selfie', 'review']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-emerald-500" />
            <h1 className="font-sans font-bold text-2xl text-gray-900">Vérification d'identité</h1>
          </div>
          <p className="text-gray-500 text-sm">Plan Confirmé · KYC sécurisé · Documents chiffrés</p>
        </div>

        {/* Stepper — visible sauf intro */}
        {step !== 'intro' && (
          <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide">
            {steps.map((s, i) => {
              const sOrder: Step[] = ['cni-recto', 'cni-verso', 'selfie', 'review']
              const sIdx = sOrder.indexOf(s.id)
              const currIdx = sOrder.indexOf(step as any)
              const done = sIdx < currIdx
              const active = s.id === step
              return (
                <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    done   ? 'bg-emerald-100 text-emerald-700' :
                    active ? 'bg-emerald-600 text-white' :
                             'bg-gray-100 text-gray-400'
                  }`}>
                    {done ? <CheckCircle size={12} /> : s.icon}
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-4 h-px ${done ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">

          {/* ── INTRO ── */}
          {step === 'intro' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Devenez un vendeur Confirmé</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  La vérification KYC protège les acheteurs et booste votre crédibilité. Processus simple en 3 étapes.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: '🪪', title: 'CNI Recto',    desc: 'Photo recto de votre carte nationale d\'identité' },
                  { icon: '🪪', title: 'CNI Verso',    desc: 'Photo verso de votre carte nationale d\'identité' },
                  { icon: '🤳', title: 'Selfie + CNI', desc: 'Photo de vous tenant votre CNI — analysée par IA' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Lock size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Vos documents sont 100% sécurisés.</strong> Chiffrés, jamais partagés avec des tiers, uniquement utilisés pour votre vérification.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep('cni-recto')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Commencer la vérification <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── CNI RECTO ── */}
          {step === 'cni-recto' && (
            <div>
              <h2 className="font-bold text-lg text-gray-900 mb-1">📸 CNI — Face avant (Recto)</h2>
              <p className="text-gray-500 text-sm mb-5">Photo claire du recto de votre carte nationale d'identité.</p>

              {!cniRecto ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl p-8 cursor-pointer transition-colors group bg-gray-50 hover:bg-emerald-50/30">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileSelect(e.target.files, setCniRecto, false)} />
                  <Upload size={32} className="text-gray-300 group-hover:text-emerald-400 mb-3 transition-colors" />
                  <p className="text-sm font-semibold text-gray-500 group-hover:text-emerald-600">Cliquez pour ajouter la photo</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 10 Mo</p>
                </label>
              ) : (
                <div>
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                    <img src={cniRecto.preview} alt="CNI Recto" className="w-full object-cover max-h-48" />
                    <button
                      onClick={() => removeFile(setCniRecto, cniRecto)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                      <CheckCircle size={10} /> Photo ajoutée
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  💡 <strong>Conseil :</strong> Photographiez sur fond clair, sans reflet, lisible dans son intégralité.
                </p>
              </div>
            </div>
          )}

          {/* ── CNI VERSO ── */}
          {step === 'cni-verso' && (
            <div>
              <h2 className="font-bold text-lg text-gray-900 mb-1">📸 CNI — Face arrière (Verso)</h2>
              <p className="text-gray-500 text-sm mb-5">Photo claire du verso de votre carte nationale d'identité.</p>

              {!cniVerso ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl p-8 cursor-pointer transition-colors group bg-gray-50 hover:bg-emerald-50/30">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileSelect(e.target.files, setCniVerso, false)} />
                  <Upload size={32} className="text-gray-300 group-hover:text-emerald-400 mb-3 transition-colors" />
                  <p className="text-sm font-semibold text-gray-500 group-hover:text-emerald-600">Cliquez pour ajouter la photo</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 10 Mo</p>
                </label>
              ) : (
                <div>
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                    <img src={cniVerso.preview} alt="CNI Verso" className="w-full object-cover max-h-48" />
                    <button
                      onClick={() => removeFile(setCniVerso, cniVerso)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                      <CheckCircle size={10} /> Photo ajoutée
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  💡 <strong>Conseil :</strong> Assurez-vous que le code-barres et les informations sont bien visibles.
                </p>
              </div>
            </div>
          )}

          {/* ── SELFIE + CNI (avec détection faciale IA) ── */}
          {step === 'selfie' && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-lg text-gray-900">🤳 Selfie avec votre CNI</h2>
                <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">IA</span>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                Prenez une photo de vous en tenant votre CNI visible à côté de votre visage.
              </p>

              {!selfie ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl p-8 cursor-pointer transition-colors group bg-gray-50 hover:bg-emerald-50/30">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileSelect(e.target.files, setSelfie, true)} />
                  <Camera size={32} className="text-gray-300 group-hover:text-emerald-400 mb-3 transition-colors" />
                  <p className="text-sm font-semibold text-gray-500 group-hover:text-emerald-600">Cliquez pour ajouter votre selfie</p>
                  <p className="text-xs text-gray-400 mt-1">Détection de visage automatique par IA</p>
                </label>
              ) : (
                <div>
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                    <img src={selfie.preview} alt="Selfie CNI" className="w-full object-cover max-h-56" />
                    <button
                      onClick={() => removeFile(setSelfie, selfie)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    {selfie.faceStatus === 'detected' && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                        <CheckCircle size={10} /> Visage détecté par IA
                      </div>
                    )}
                    {(selfie.faceStatus === 'analyzing' || selfie.faceStatus === 'loading-model') && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        <Loader2 size={10} className="animate-spin" /> Analyse IA...
                      </div>
                    )}
                    {selfie.faceStatus === 'not-detected' && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        <AlertCircle size={10} /> Visage non détecté
                      </div>
                    )}
                  </div>

                  {/* Badge statut détection */}
                  <FaceStatusBadge status={selfie.faceStatus || 'idle'} />
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-700">
                  🤖 <strong>Analyse IA :</strong> Notre système vérifie automatiquement la présence de votre visage pour valider le selfie avant envoi.
                </p>
              </div>
            </div>
          )}

          {/* ── REVIEW ── */}
          {step === 'review' && (
            <div>
              <h2 className="font-bold text-lg text-gray-900 mb-1">✅ Vérification finale</h2>
              <p className="text-gray-500 text-sm mb-5">Vérifiez vos documents avant soumission.</p>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'CNI Recto',    doc: cniRecto,  onClick: () => setStep('cni-recto') },
                  { label: 'CNI Verso',    doc: cniVerso,  onClick: () => setStep('cni-verso') },
                  { label: 'Selfie + CNI', doc: selfie,    onClick: () => setStep('selfie') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    {item.doc ? (
                      <img src={item.doc.preview} alt={item.label} className="w-16 h-12 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center">
                        <AlertCircle size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                      {item.doc ? (
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={10} /> Document prêt
                          {item.label === 'Selfie + CNI' && item.doc.faceStatus === 'detected' && ' · Visage IA ✓'}
                        </p>
                      ) : (
                        <p className="text-xs text-red-500">Manquant</p>
                      )}
                    </div>
                    <button onClick={item.onClick} className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
                      Modifier
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                <p className="text-xs text-emerald-700 leading-relaxed">
                  <strong>Délai de validation :</strong> Notre équipe examine votre dossier sous <strong>24 à 48h</strong>. Vous serez notifié par email.
                </p>
              </div>
            </div>
          )}

          {/* ── NAVIGATION ── */}
          {step !== 'intro' && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={prevStep}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                ← Retour
              </button>

              {step !== 'review' ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  Suivant <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 text-sm"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Envoi en cours...</>
                  ) : (
                    <><Shield size={15} /> Soumettre le dossier</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}