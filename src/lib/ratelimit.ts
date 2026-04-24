import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

let rateLimitPublier: Ratelimit

function getPublierLimiter() {
  if (rateLimitPublier) return rateLimitPublier

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[ratelimit] Upstash manquant - 10 req/min max')
    rateLimitPublier = {
      limit: async () => ({ success: true, remaining: 10, reset: 0, limit: 10 })
    } as any
    return rateLimitPublier
  }

  const redis = Redis.fromEnv()
  rateLimitPublier = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  })
  return rateLimitPublier
}

export function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function limitPublier(req: NextRequest) {
  const ip = getIP(req)
  const result = await getPublierLimiter().limit(ip)
  if (!result.success) {
    return new Response('Trop de tentatives. Attendez 1 minute.', {
      status: 429,
      headers: { 'Retry-After': '60' }
    })
  }
  return null
}

export const rateLimitStrict = {
  limit: async (ip: string) => {
    return await getPublierLimiter().limit(ip)
  }
}

export const rateLimitWebhook = {
  limit: async (ip: string) => {
    return await getPublierLimiter().limit(ip)
  }
}