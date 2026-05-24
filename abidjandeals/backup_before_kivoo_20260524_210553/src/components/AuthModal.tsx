'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { supabase, Profile } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ── Étapes de l'inscription ──────────────────────────────────
type RegisterStep = 'form' | 'verify-phone'

export function AuthModal() {
  const router = useRouter()
  const {
    user, setUser,
    authModalOpen, setAuthModalOpen,
    pendingAction, setPendingAction,
  } = useStore()

  const [tab,          setTab]          = useState<'login' | 'register'>('login')
  const [regStep,      setRegStep]      = useState<RegisterStep>('form')
  const [loading,      setLoading]      = useState(false)
  const [showPwd,      setShowPwd]      = useState(false)
  const [otpCode,      setOtpCode]      = useState('')
  const [otpLoading,   setOtpLoading]   = useState(false)
  const [otpSent,      setOtpSent]      = useState(false)
  const [otpError,     setOtpError]     = useState('')
  const [countdown,    setCountdown]    = useState(0)

  // Login
  const [email, setEmail] = useState('')
  const [pwd,   setPwd]   = useState('')

  // Register
  const [prenom,   setPrenom]   = useState('')
  const [nom,      setNom]      = useState('')
  const [tel,      setTel]      = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPwd,   setRegPwd]   = useState('')

  // Countdown renvoi OTP
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (!user || !authModalOpen || !loading) return
    closeAndRedirect(user.prenom)
  }, [user])

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => {
      setLoading(false)
      toast.error('Connexion trop lente. Réessayez.')
    }, 5000)
    return () => clearTimeout(timer)
  }, [loading])

  if (!authModalOpen) return null

  function closeAndRedirect(prenom?: string) {
    setLoading(false)
    setAuthModalOpen(false)
    toast.success(`Bienvenue ${prenom || ''} 👋`)
    if (pendingAction === 'publish') {
      setPendingAction(null)
      router.push('/publier')
    } else {
      router.push('/dashboard')
    }
  }

  // ── Connexion ────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd })

      if (error) {
        toast.error('Identifiants incorrects')
        setLoading(false) // ✅ FIX
        return
      }

      const userId = data.user?.id
      if (!userId) {
        toast.error('Erreur inattendue. Réessayez.')
        setLoading(false) // ✅ FIX
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', userId).single()

      if (profileError || !profile) {
        toast.error('Profil introuvable. Contactez le support.')
        console.error('Profile error:', profileError)
        setLoading(false) // ✅ FIX
        return
      }

      setUser(profile as Profile)
      closeAndRedirect(profile.prenom)
    } catch {
      toast.error('Erreur de connexion. Réessayez.')
      setLoading(false) // ✅ FIX
    }
  }

  // ── Inscription étape 1 : création du compte ─────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (regPwd.length < 8) { toast.error('Mot de passe trop court (min. 8 caractères)'); return }
    if (!tel.trim()) { toast.error('Le numéro de téléphone est obligatoire'); return }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPwd,
        options: { data: { prenom, nom, tel } },
      })
      if (error) { toast.error(error.message); return }

      // Passer à la vérification téléphone
      setRegStep('verify-phone')
      await sendOtp()
    } catch {
      toast.error('Erreur lors de la création du compte.')
    } finally {
      setLoading(false)
    }
  }

  // ── Envoi OTP ────────────────────────────────────────────────
  async function sendOtp() {
    setOtpLoading(true)
    setOtpError('')
    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: tel }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOtpError(data.error ?? 'Erreur envoi SMS')
        return
      }

      setOtpSent(true)
      setCountdown(60)
      toast.success(`SMS envoyé au ${tel}`)
    } catch {
      setOtpError('Impossible d\'envoyer le SMS. Vérifiez votre numéro.')
    } finally {
      setOtpLoading(false)
    }
  }

  // ── Vérification OTP ─────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otpCode.length < 4) { setOtpError('Code trop court'); return }

    setOtpLoading(true)
    setOtpError('')
    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: tel, token: otpCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOtpError(data.error ?? 'Code incorrect')
        return
      }

      toast.success('Téléphone vérifié ✅')
      setAuthModalOpen(false)
      router.push('/vendeur#niveaux')
    } catch {
      setOtpError('Erreur de vérification. Réessayez.')
    } finally {
      setOtpLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { if (!loading && !otpLoading) setAuthModalOpen(false) }}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-dark to-gray-800 px-8 pt-8 pb-6 relative">
          <button
            onClick={() => { if (!loading && !otpLoading) setAuthModalOpen(false) }}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="text-3xl mb-3">🇨🇮</div>
          <h2 className="text-white font-sans font-bold text-2xl">
            {tab === 'login'
              ? 'Bon retour !'
              : regStep === 'verify-phone'
              ? 'Vérification téléphone'
              : 'Rejoignez-nous'}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {tab === 'login'
              ? 'Connectez-vous à votre compte AbidjanDeals'
              : regStep === 'verify-phone'
              ? `Code envoyé au ${tel}`
              : 'Créez votre compte gratuitement'}
          </p>

          {regStep === 'form' && (
            <div className="flex gap-1 mt-5 bg-white/10 p-1 rounded-xl">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === 'login' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                S&apos;inscrire
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-8 py-6">

          {/* ── Connexion ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10" placeholder="votre@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'} required value={pwd}
                    onChange={e => setPwd(e.target.value)}
                    className="input-field pl-10 pr-10" placeholder="••••••••"
                  />
                  <button
                    type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-70"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Connexion...
                    </span>
                  : 'Se connecter'}
              </button>
            </form>
          )}

          {/* ── Inscription étape 1 : formulaire ── */}
          {tab === 'register' && regStep === 'form' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" required value={prenom}
                      onChange={e => setPrenom(e.target.value)}
                      className="input-field pl-10" placeholder="Kouamé"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                  <input
                    type="text" required value={nom}
                    onChange={e => setNom(e.target.value)}
                    className="input-field" placeholder="Koffi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone <span className="text-orange-500">*</span>
                  <span className="text-xs text-gray-400 font-normal ml-1">(sera vérifié par SMS)</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel" required value={tel}
                    onChange={e => setTel(e.target.value)}
                    className="input-field pl-10"
                    placeholder="+225 07 00 00 00 00"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Wave, Orange Money, MTN ou Moov — numéro ivoirien requis
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" required value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="input-field pl-10" placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'} required value={regPwd}
                    onChange={e => setRegPwd(e.target.value)}
                    className="input-field pl-10 pr-10" placeholder="Min. 8 caractères"
                  />
                  <button
                    type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-70"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Création du compte...
                    </span>
                  : 'Créer mon compte gratuit'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                En vous inscrivant vous acceptez nos{' '}
                <span className="text-orange-500 cursor-pointer">CGU</span>
              </p>
            </form>
          )}

          {/* ── Inscription étape 2 : vérification OTP ── */}
          {tab === 'register' && regStep === 'verify-phone' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone size={28} className="text-orange-500" />
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Entrez le code à 6 chiffres reçu par SMS au
                  <br />
                  <strong className="text-gray-900">{tel}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">
                  Code de vérification
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => {
                    setOtpCode(e.target.value.replace(/\D/g, ''))
                    setOtpError('')
                  }}
                  placeholder="000000"
                  className="input-field text-center text-2xl tracking-widest font-bold"
                  autoFocus
                />
                {otpError && (
                  <p className="text-xs text-red-500 mt-1 text-center">{otpError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length < 4}
                className="btn-primary w-full justify-center py-3 disabled:opacity-70"
              >
                {otpLoading
                  ? <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Vérification...
                    </span>
                  : <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Vérifier mon numéro
                    </span>
                }
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-gray-400">
                    Renvoyer dans <strong>{countdown}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpLoading}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    {otpLoading ? 'Envoi...' : 'Renvoyer le code'}
                  </button>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setRegStep('form'); setOtpCode(''); setOtpError('') }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Changer de numéro
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}