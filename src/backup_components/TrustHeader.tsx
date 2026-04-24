'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard, PlusCircle, X, Menu, HelpCircle } from 'lucide-react'

const PHONE_NUMBER = '+2250707607724'
const WHATSAPP_NUMBER = '2250707607724'
const WHATSAPP_MSG = encodeURIComponent("Bonjour, j'ai besoin d'aide pour certifier ma boutique sur Abidjandeals")

const SECURITY_TIPS = [
  { icon: '🔒', text: 'Connexion sécurisée HTTPS' },
  { icon: '🚫', text: 'Zéro paiement à distance' },
  { icon: '✅', text: 'Rencontrez en lieu public' },
  { icon: '🛡️', text: 'Vendeurs certifiés KYC' },
]

const NAV_LINKS = [
  { href: '/',          label: 'Accueil',   icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export function TrustHeader() {
  const [supportOpen, setSupportOpen] = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* ── BARRE FIXE PREMIUM ── */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-[#0D1B2A] border-b border-white/[0.06]"
           style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04)' }}>

        {/* Ligne fine de sécurité — discrète, très fine */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '0.5px solid rgba(255,255,255,0.05)',
          padding: '0 24px',
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          overflow: 'hidden',
        }}>
          {SECURITY_TIPS.map((tip, i) => (
            <span key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10, color: 'rgba(255,255,255,0.35)',
              whiteSpace: 'nowrap', letterSpacing: '0.02em',
            }}>
              <span style={{ fontSize: 9 }}>{tip.icon}</span>
              {tip.text}
            </span>
          ))}
        </div>

        {/* Barre principale */}
        <div style={{
          maxWidth: '100%',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>

          {/* Logo → lien vers accueil */}
          <Link href="/" style={{
            textDecoration: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{
              fontWeight: 900,
              fontSize: 20,
              color: '#F5A623',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}>
              Abidjan<span style={{ color: '#ffffff' }}>Deals</span>
            </span>
          </Link>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* ── NAVIGATION DROITE (desktop) ── */}
          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 2 }}>

            {/* Liens textuels avec icônes discrètes */}
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link key={href} href={href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }
                  }}
                >
                  <Icon size={14} strokeWidth={1.75} style={{ opacity: 0.7 }} />
                  {label}
                </Link>
              )
            })}

            {/* Divider vertical */}
            <div style={{
              width: 1,
              height: 18,
              background: 'rgba(255,255,255,0.1)',
              margin: '0 8px',
            }} />

            {/* Bouton Publier — outline, pas de fond plein */}
            <Link href="/publier" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              color: '#F97316',
              border: '1px solid rgba(249,115,22,0.45)',
              background: 'transparent',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#F97316'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.08)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.45)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <PlusCircle size={14} strokeWidth={2} />
              Publier
            </Link>

            {/* Divider vertical */}
            <div style={{
              width: 1,
              height: 18,
              background: 'rgba(255,255,255,0.1)',
              margin: '0 6px',
            }} />

            {/* Point d'interrogation — tooltip sécurité */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
            >
              <button style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'
                }}
              >
                <HelpCircle size={14} strokeWidth={1.75} />
              </button>

              {/* Tooltip sécurité */}
              {tooltipOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: '#1a2535',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  width: 230,
                  zIndex: 999,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {/* Flèche */}
                  <div style={{
                    position: 'absolute',
                    top: -5,
                    right: 10,
                    width: 10,
                    height: 10,
                    background: '#1a2535',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    borderBottom: 'none',
                    borderRight: 'none',
                    transform: 'rotate(45deg)',
                  }} />
                  <p style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                  }}>
                    Conseils de sécurité
                  </p>
                  {SECURITY_TIPS.map((tip, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 0',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.65)',
                    }}>
                      <div style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#22c55e',
                        flexShrink: 0,
                      }} />
                      {tip.text}
                    </div>
                  ))}
                  <div style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '0.5px solid rgba(255,255,255,0.08)',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    Ne payez jamais à distance
                  </div>
                </div>
              )}
            </div>

            {/* Bouton Support */}
            <button
              onClick={() => setSupportOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                marginLeft: 4,
              }}
            >
              <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#22c55e', opacity: 0.7,
                  animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{
                  position: 'relative', borderRadius: '50%',
                  width: 8, height: 8, background: '#22c55e', display: 'block',
                }} />
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>
                Support
              </span>
            </button>
          </nav>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden"
            style={{
              padding: 8, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Animation ping pour le dot support */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* ── MENU MOBILE OVERLAY ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[203] md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className={`fixed top-0 left-0 bottom-0 z-[204] md:hidden`}
        style={{
          width: 280,
          background: '#0D1B2A',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
        }}>
        <div style={{ padding: '20px 20px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#F5A623' }}>
              Abidjan<span style={{ color: '#fff' }}>Deals</span>
            </span>
            <button onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                color: pathname === href ? '#fff' : 'rgba(255,255,255,0.55)',
                background: pathname === href ? 'rgba(255,255,255,0.08)' : 'transparent',
              }}>
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </Link>
            ))}
            <Link href="/publier" onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginTop: 4, borderRadius: 8,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: '#F97316',
              border: '1px solid rgba(249,115,22,0.35)',
            }}>
              <PlusCircle size={16} strokeWidth={2} />
              Publier une annonce
            </Link>
          </nav>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Sécurité
          </p>
          {SECURITY_TIPS.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ fontSize: 11 }}>{tip.icon}</span>
              {tip.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── OVERLAY SUPPORT ── */}
      {supportOpen && (
        <div
          className="fixed inset-0 z-[201]"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSupportOpen(false)}
        />
      )}

      {/* ── DRAWER SUPPORT ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 202,
        background: '#0D1B2A',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
        transform: supportOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        padding: '0 0 env(safe-area-inset-bottom)',
      }}>
        <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99, margin: '0 auto 20px' }} />
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Notre équipe est là pour vous</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>Disponible du Lundi au Samedi - 8h à 20h (Abidjan)</p>

          <a href={`tel:${PHONE_NUMBER}`} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 10,
            textDecoration: 'none',
          }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#60a5fa" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Appeler un conseiller</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>Réponse immédiate en Français et Dioula</p>
            </div>
          </a>

          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
            textDecoration: 'none',
          }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#34d399" style={{ width: 18, height: 18 }}>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.979-1.418A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.073-1.117l-.291-.173-3.018.859.874-2.941-.19-.302A7.95 7.95 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8zm4.406-5.844c-.241-.12-1.427-.704-1.649-.785-.221-.08-.382-.12-.543.12-.16.241-.622.785-.762.946-.14.16-.281.18-.522.06-.241-.12-1.018-.375-1.938-1.196-.716-.639-1.2-1.428-1.34-1.668-.14-.241-.015-.371.105-.491.108-.108.241-.281.361-.422.12-.14.16-.241.241-.401.08-.16.04-.301-.02-.422-.06-.12-.543-1.309-.743-1.793-.196-.472-.394-.408-.543-.416l-.462-.008c-.16 0-.421.06-.642.301-.22.241-.842.823-.842 2.008 0 1.185.862 2.33.982 2.49.12.16 1.698 2.593 4.115 3.637.575.248 1.023.397 1.373.508.577.184 1.102.158 1.517.096.463-.069 1.427-.584 1.628-1.148.2-.564.2-1.048.14-1.148-.06-.1-.22-.16-.462-.28z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Aide KYC via WhatsApp</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>Certifiez votre boutique en quelques minutes</p>
            </div>
          </a>

          <button onClick={() => setSupportOpen(false)} style={{
            width: '100%', padding: '12px', background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: 14, cursor: 'pointer',
          }}>
            Fermer
          </button>
        </div>
      </div>
    </>
  )
}