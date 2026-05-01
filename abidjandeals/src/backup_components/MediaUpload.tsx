'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { ImagePlus, Video, X, Lock, CheckCircle2, AlertTriangle, UploadCloud, Volume2, VolumeX } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
  width?: number
  height?: number
  error?: string
}

interface MediaUploadProps {
  onChange?: (files: File[]) => void
  maxFiles?: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_PX = 1080
const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp'
const ACCEPTED_VIDEOS = 'video/mp4,video/quicktime'

// ─── Helper résolution ────────────────────────────────────────────────────────
function checkImageDimensions(file: File): Promise<{ w: number; h: number; error?: string }> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const error = img.width < MIN_PX && img.height < MIN_PX
        ? `Résolution trop faible (${img.width}×${img.height}px — min ${MIN_PX}px requis)`
        : undefined
      resolve({ w: img.width, h: img.height, error })
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ w: 0, h: 0, error: 'Fichier illisible' }) }
    img.src = url
  })
}

// ─── Sous-composant : preview vidéo avec autoplay et toggle son ───────────────
function VideoPreview({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newMuted = !muted
    setMuted(newMuted)
    if (videoRef.current) videoRef.current.muted = newMuted
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted           // Requis navigateur pour autoplay
        playsInline     // iOS : pas de fullscreen automatique
        preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Bouton toggle son — cliquable */}
      <button
        type="button"
        onClick={toggleMute}
        title={muted ? 'Activer le son' : 'Couper le son'}
        style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(0,0,0,0.6)',
          border: 'none',
          borderRadius: 20,
          padding: '3px 7px',
          cursor: 'pointer',
          color: 'white',
          zIndex: 10,
        }}
      >
        {muted
          ? <VolumeX size={10} style={{ color: 'rgba(255,255,255,0.8)' }} />
          : <Volume2 size={10} style={{ color: 'white' }} />
        }
        <span style={{ fontSize: 9, fontWeight: 500, color: muted ? 'rgba(255,255,255,0.75)' : 'white' }}>
          {muted ? 'Son off' : 'Son on'}
        </span>
      </button>

      {/* Indicateur ▶ Vidéo — coin inférieur gauche */}
      <div style={{ position: 'absolute', bottom: 6, left: 6, zIndex: 10 }}>
        <span style={{
          background: 'rgba(0,0,0,0.55)',
          color: 'white',
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 4,
        }}>
          ▶ Vidéo
        </span>
      </div>
    </div>
  )
}

// ─── Component principal ──────────────────────────────────────────────────────
export default function MediaUpload({ onChange, maxFiles = 8 }: MediaUploadProps) {
  const { user } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [files, setFiles]         = useState<MediaFile[]>([])
  const [dragging, setDragging]   = useState(false)

  const isKycValide = kycStatus === 'valide'

  // ── Fetch kyc_status ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setKycStatus(data?.kyc_status ?? 'non_soumis'))
  }, [user])

  // ── Process files ─────────────────────────────────────────────────────────
  const processFiles = async (raw: FileList | File[]) => {
    const list = Array.from(raw)
    const results: MediaFile[] = []

    for (const file of list) {
      if (files.length + results.length >= maxFiles) break
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type === 'video/mp4' || file.type === 'video/quicktime'

      if (isVideo && !isKycValide) continue
      if (!isImage && !isVideo) continue

      const preview = URL.createObjectURL(file)
      if (isImage) {
        const { w, h, error } = await checkImageDimensions(file)
        results.push({ file, preview, type: 'image', width: w, height: h, error })
      } else {
        results.push({ file, preview, type: 'video' })
      }
    }

    const updated = [...files, ...results]
    setFiles(updated)
    onChange?.(updated.filter(m => !m.error).map(m => m.file))
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const removeFile = (i: number) => {
    const updated = files.filter((_, idx) => idx !== i)
    setFiles(updated)
    onChange?.(updated.filter(m => !m.error).map(m => m.file))
  }

  const accept = isKycValide ? `${ACCEPTED_IMAGES},${ACCEPTED_VIDEOS}` : ACCEPTED_IMAGES

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Badge KYC validé */}
      {isKycValide && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} /> Compte certifié — photos & vidéos HD autorisées
        </div>
      )}

      {/* Alerte vidéo bloquée */}
      {!isKycValide && kycStatus !== null && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fefce8', border: '0.5px solid #fde68a', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#a16207' }}>
          <Lock size={15} style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ margin: 0 }}>
            La vidéo est réservée aux membres certifiés.{' '}
            <Link href="/verification-documents" style={{ fontWeight: 700, color: '#a16207', textDecoration: 'underline' }}>
              Passer le KYC
            </Link>
          </p>
        </div>
      )}

      {/* Zone de dépôt */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#F97316' : '#e5e7eb'}`,
          borderRadius: 16,
          padding: '32px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#fff7ed' : 'white',
          transition: 'all 0.15s',
        }}
      >
        <UploadCloud size={36} style={{ color: '#d1d5db', margin: '0 auto 10px' }} />
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          Glissez vos fichiers ici ou{' '}
          <span style={{ color: '#F97316', fontWeight: 700 }}>cliquez pour sélectionner</span>
        </p>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          Photos JPG / PNG / WebP · min {MIN_PX}px
          {isKycValide && ' · Vidéos MP4 / MOV'}
          {' '}· max {maxFiles} fichiers
        </p>
        <input ref={inputRef} type="file" accept={accept} multiple style={{ display: 'none' }} onChange={handleInput} />
      </div>

      {/* Chips types autorisés */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#eff6ff', border: '0.5px solid #bfdbfe', borderRadius: 8, padding: '6px 12px', color: '#3b82f6' }}>
          <ImagePlus size={13} /> Photos HD
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, borderRadius: 8, padding: '6px 12px', border: '0.5px solid #e5e7eb',
          background: isKycValide ? '#f0fdf4' : '#f9fafb',
          color: isKycValide ? '#16a34a' : '#9ca3af',
          textDecoration: isKycValide ? 'none' : 'line-through',
        }}>
          <Video size={13} /> Vidéos MP4/MOV
          {!isKycValide && <Lock size={11} />}
        </span>
      </div>

      {/* Prévisualisations */}
      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {files.map((m, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: '#f3f4f6' }}>

              {/* ── Preview image ──────────────────────────────────────────── */}
              {m.type === 'image' && (
                <img src={m.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}

              {/* ── Preview vidéo : autoplay + toggle son ──────────────────── */}
              {m.type === 'video' && (
                <VideoPreview src={m.preview} />
              )}

              {/* Overlay erreur */}
              {m.error && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(127,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center' }}>
                  <AlertTriangle size={16} style={{ color: '#fecaca', marginBottom: 4 }} />
                  <p style={{ color: '#fecaca', fontSize: 10, lineHeight: 1.3, margin: 0 }}>{m.error}</p>
                </div>
              )}

              {/* Dimensions image (si pas d'erreur) */}
              {!m.error && m.type === 'image' && (
                <div style={{ position: 'absolute', bottom: 6, left: 6 }}>
                  <span style={{ background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                    {m.width}×{m.height}
                  </span>
                </div>
              )}

              {/* Bouton supprimer */}
              <button type="button" onClick={() => removeFile(i)}
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 20 }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
