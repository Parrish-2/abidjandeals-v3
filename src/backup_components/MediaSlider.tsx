"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface MediaSliderProps {
  media: MediaItem[];
  alt?: string;
  aspectClass?: string; // e.g. "aspect-square" | "aspect-[4/3]"
}

// ─── VideoMiniPlayer ────────────────────────────────────────────────────────
interface VideoMiniPlayerProps {
  videoUrl: string;
  onClose: () => void;
  onExpand: () => void;
}

function VideoMiniPlayer({ videoUrl, onClose, onExpand }: VideoMiniPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Position en pixels depuis le coin haut-gauche du conteneur parent
  const [pos, setPos] = useState({ x: -1, y: -1 }); // -1 = pas encore initialisé
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Initialise la position par défaut (bas-droit) après le premier rendu
  useEffect(() => {
    const parent = dragRef.current?.parentElement;
    if (!parent) return;
    const pw = parent.clientWidth;
    const ph = parent.clientHeight;
    const w = dragRef.current?.offsetWidth ?? 72;
    const h = dragRef.current?.offsetHeight ?? 90;
    setPos({ x: pw - w - 8, y: ph - h - 36 });
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.play().catch(() => { });
  }, []);

  // ── Drag handlers (souris) ──
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current || !dragRef.current) return;
      const parent = dragRef.current.parentElement;
      if (!parent) return;
      const pw = parent.clientWidth;
      const ph = parent.clientHeight;
      const w = dragRef.current.offsetWidth;
      const h = dragRef.current.offsetHeight;
      setPos({
        x: Math.min(Math.max(0, ev.clientX - dragOffset.current.x), pw - w),
        y: Math.min(Math.max(0, ev.clientY - dragOffset.current.y), ph - h),
      });
    };

    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ── Drag handlers (touch) ──
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragging.current = true;
    dragOffset.current = {
      x: t.clientX - pos.x,
      y: t.clientY - pos.y,
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || !dragRef.current) return;
    e.stopPropagation(); // empêche le swipe du slider
    const t = e.touches[0];
    const parent = dragRef.current.parentElement;
    if (!parent) return;
    const pw = parent.clientWidth;
    const ph = parent.clientHeight;
    const w = dragRef.current.offsetWidth;
    const h = dragRef.current.offsetHeight;
    setPos({
      x: Math.min(Math.max(0, t.clientX - dragOffset.current.x), pw - w),
      y: Math.min(Math.max(0, t.clientY - dragOffset.current.y), ph - h),
    });
  };

  const onTouchEnd = () => { dragging.current = false; };

  // Masquer tant que la position n'est pas calculée
  if (pos.x === -1) return <div ref={dragRef} className="absolute opacity-0 w-[72px] h-[90px]" />;

  return (
    <div
      ref={dragRef}
      className="absolute z-30"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-[72px] h-[90px] md:w-[88px] md:h-[110px] rounded-xl shadow-2xl overflow-hidden border border-white/40 cursor-grab active:cursor-grabbing group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          onClick={onExpand}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-2 bg-black/20"
          onClick={onExpand}
        >
          <div className="flex items-center gap-[2px] mb-1">
            <div className="w-[2px] h-2 rounded bg-white/70 animate-[bounce_1s_infinite_0ms]" />
            <div className="w-[2px] h-3 rounded bg-white/70 animate-[bounce_1s_infinite_150ms]" />
            <div className="w-[2px] h-2 rounded bg-white/70 animate-[bounce_1s_infinite_300ms]" />
            <div className="w-[2px] h-3 rounded bg-white/70 animate-[bounce_1s_infinite_450ms]" />
          </div>
          <span className="text-[8px] text-white/80 leading-none">▶ vidéo</span>
        </div>
        <button
          aria-label="Masquer la vidéo"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-1 right-1 z-40 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center hover:bg-black/90 transition-colors leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── VideoModal ─────────────────────────────────────────────────────────────
interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

function VideoModal({ videoUrl, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => { });
    return () => { v.pause(); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-[9/16] object-cover bg-black"
          controls
          playsInline
          autoPlay
        />
        <button
          aria-label="Fermer la vidéo"
          onClick={onClose}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-sm"
        >
          ✕
        </button>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 rounded-full px-3 py-1 text-white text-[10px]">
          🔊 Son activé
        </div>
      </div>
    </div>
  );
}

// ─── MediaSlider (main export) ───────────────────────────────────────────────
export default function MediaSlider({
  media,
  alt = "Photo produit",
  aspectClass = "aspect-square",
}: MediaSliderProps) {
  // Séparer images et vidéo
  const images = media.filter((m) => m.type === 'image').map((m) => m.url);
  const videoItem = media.find((m) => m.type === 'video');
  const videoUrl = videoItem?.url ?? '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoVisible, setVideoVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const touchStartX = useRef<number>(0);

  const goTo = useCallback(
    (idx: number) => {
      setCurrentIndex(((idx % images.length) + images.length) % images.length);
    },
    [images.length]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) goTo(currentIndex + (dx < 0 ? 1 : -1));
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className="relative w-full select-none overflow-hidden">

        {/* ── Image carousel ──────────────────────────────────── */}
        <div
          className={`relative ${aspectClass} overflow-hidden bg-neutral-100`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((src, i) => (
              <div key={i} className="flex-none w-full h-full">
                <img
                  src={src}
                  alt={`${alt} – ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <button
              aria-label="Photo précédente"
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 shadow hover:bg-white transition-colors text-sm"
            >
              ‹
            </button>
          )}

          {images.length > 1 && (
            <button
              aria-label="Photo suivante"
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 shadow hover:bg-white transition-colors text-sm"
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Aller à la photo ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/55"
                    }`}
                />
              ))}
            </div>
          )}

          <div className="absolute top-2 right-2 z-10 bg-black/35 text-white text-[10px] rounded-full px-2 py-0.5 tabular-nums">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
        {/* ── End image carousel ──────────────────────────────── */}

        {/* ── Video mini player ── */}
        {videoUrl && videoVisible && (
          <VideoMiniPlayer
            videoUrl={videoUrl}
            onClose={() => setVideoVisible(false)}
            onExpand={() => setModalOpen(true)}
          />
        )}

        {videoUrl && !videoVisible && (
          <button
            onClick={() => setVideoVisible(true)}
            className="absolute bottom-9 right-2 z-30 flex items-center gap-1.5 bg-black/55 hover:bg-black/80 text-white text-[11px] rounded-full px-3 py-1.5 transition-colors border border-white/20"
          >
            ▶ Vidéo
          </button>
        )}
      </div>

      {modalOpen && (
        <VideoModal videoUrl={videoUrl} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}