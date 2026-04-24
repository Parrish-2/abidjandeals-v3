import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// Limites vidéo par catégorie
const VIDEO_LIMITS: Record<string, { maxDuration: number; maxSizeMB: number }> = {
  immobilier:   { maxDuration: 180, maxSizeMB: 200 },
  vehicules:    { maxDuration: 120, maxSizeMB: 150 },
  electronique: { maxDuration: 60,  maxSizeMB: 80  },
  mode:         { maxDuration: 45,  maxSizeMB: 50  },
  emploi:       { maxDuration: 60,  maxSizeMB: 50  },
  alimentation: { maxDuration: 45,  maxSizeMB: 50  },
  services:     { maxDuration: 60,  maxSizeMB: 80  },
  animaux:      { maxDuration: 45,  maxSizeMB: 50  },
  sport:        { maxDuration: 60,  maxSizeMB: 50  },
  autres:       { maxDuration: 60,  maxSizeMB: 50  },
}

const DEFAULT_VIDEO_LIMIT = { maxDuration: 60, maxSizeMB: 50 }

const ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const ACCEPTED_VIDEOS = ['video/mp4', 'video/quicktime']

// ✅ Noms corrects des buckets Supabase
const IMAGE_BUCKET = 'ad-photos'
const VIDEO_BUCKET = 'ad-videos'

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = reject
    video.src = URL.createObjectURL(file)
  })
}

async function compressImage(file: File): Promise<File> {
  try {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp',
    }
    return await imageCompression(file, options)
  } catch {
    console.warn('Compression échouée, utilisation original')
    return file
  }
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateAndUploadFile = async (
    file: File,
    userId: string,
    category: string
  ): Promise<{ url: string; type: 'image' | 'video' } | null> => {
    const isImage = ACCEPTED_IMAGES.includes(file.type)
    const isVideo = ACCEPTED_VIDEOS.includes(file.type)

    if (!isImage && !isVideo) {
      toast.error(`Format non supporté: ${file.name}`)
      return null
    }

    if (isVideo) {
      const limits = VIDEO_LIMITS[category] || DEFAULT_VIDEO_LIMIT
      const sizeMB = file.size / (1024 * 1024)

      if (sizeMB > limits.maxSizeMB) {
        toast.error(`Vidéo trop lourde (${sizeMB.toFixed(0)}MB). Maximum ${limits.maxSizeMB}MB.`)
        return null
      }

      try {
        const duration = await getVideoDuration(file)
        if (duration > limits.maxDuration) {
          const maxMin = Math.floor(limits.maxDuration / 60)
          const maxSec = limits.maxDuration % 60
          toast.error(`Vidéo trop longue. Maximum ${maxMin}min${maxSec > 0 ? ' ' + maxSec + 's' : ''} pour ${category}.`)
          return null
        }
      } catch {
        toast.error('Impossible de lire la durée de la vidéo.')
        return null
      }
    }

    let fileToUpload: File = file
    if (isImage) {
      toast.loading('🗜️ Compression en cours...', { id: 'compress' })
      fileToUpload = await compressImage(file)
      toast.dismiss('compress')
    }

    const bucket = isImage ? IMAGE_BUCKET : VIDEO_BUCKET
    const ext = isImage ? 'webp' : 'mp4'
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        contentType: isImage ? 'image/webp' : 'video/mp4',
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      toast.error(`Erreur upload: ${error.message}`)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: publicUrl, type: isImage ? 'image' : 'video' }
  }

  const uploadFiles = async (
    files: File[],
    userId: string,
    category: string
  ): Promise<{ photos: string[]; videoUrl?: string }> => {
    setUploading(true)
    setProgress(0)

    const photos: string[] = []
    let videoUrl: string | undefined

    for (let i = 0; i < files.length; i++) {
      const result = await validateAndUploadFile(files[i], userId, category)
      if (result) {
        if (result.type === 'image') photos.push(result.url)
        else videoUrl = result.url
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setUploading(false)
    setProgress(0)
    return { photos, videoUrl }
  }

  const deleteFile = async (url: string, type: 'image' | 'video' = 'image') => {
    const bucket = type === 'image' ? IMAGE_BUCKET : VIDEO_BUCKET
    const path = url.split(`/${bucket}/`)[1]
    if (!path) return
    await supabase.storage.from(bucket).remove([path])
  }

  return {
    uploadFiles,
    deleteFile,
    uploading,
    progress,
    acceptedFormats: [...ACCEPTED_IMAGES, ...ACCEPTED_VIDEOS].join(','),
    videoLimits: VIDEO_LIMITS,
  }
}
