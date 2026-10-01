import React, { useState } from 'react'

type DriveVideoProps = {
  fileId: string
  title: string
  /** Framing for the player: landscape web demo or portrait app demo. */
  frame?: 'landscape' | 'portrait'
  /** Link back to the share page, shown under the player. */
  shareUrl: string
}

/**
 * Google-Drive-hosted demo video. Streams — nothing is bundled, so page
 * weight stays flat. Tries a chromeless native <video> first (autoplay
 * muted loop, the only combo browsers allow to autostart); if Drive
 * refuses the direct stream (large-file confirm page), it falls back to
 * Drive's own preview player in an iframe. Honors reduced motion by not
 * autoplaying.
 */
export const DriveVideo: React.FC<DriveVideoProps> = ({
  fileId,
  title,
  frame = 'landscape',
  shareUrl,
}) => {
  const [directFailed, setDirectFailed] = useState(false)
  const directSrc = `https://drive.google.com/uc?export=download&id=${fileId}`
  const previewSrc = `https://drive.google.com/file/d/${fileId}/preview`
  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const shell =
    frame === 'portrait'
      ? 'w-full max-w-[340px]'
      : 'w-full max-w-4xl'

  return (
    <div className={shell}>
      <div className="bg-white dark:bg-[#0E202D] border-2 border-[#071E2D] dark:border-[#1E3A52] rounded-3xl shadow-[6px_6px_0px_#071E2D] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b-2 border-[#071E2D]/10 dark:border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C4B3] border border-[#071E2D]/30" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F3F6F8] dark:bg-white/10 border border-[#071E2D]/30 dark:border-white/20" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F3F6F8] dark:bg-white/10 border border-[#071E2D]/30 dark:border-white/20" aria-hidden="true" />
          <span className="ml-2 font-sans text-xs font-semibold text-[#071E2D]/60 dark:text-slate-400 truncate">
            {title}
          </span>
        </div>
        {!directFailed ? (
          <video
            key={directSrc}
            src={directSrc}
            className={`w-full h-auto block bg-[#071E2D] ${
              frame === 'portrait' ? 'max-h-[600px] object-contain' : ''
            }`}
            autoPlay={!reduceMotion}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label={title}
            onError={() => setDirectFailed(true)}
          />
        ) : (
          <iframe
            src={previewSrc}
            title={title}
            className={`w-full block bg-[#071E2D] ${
              frame === 'portrait' ? 'aspect-[9/16] max-h-[600px]' : 'aspect-video'
            }`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
      <p className="font-sans text-xs text-[#071E2D]/55 dark:text-slate-400 text-center mt-3">
        Hosted on Google Drive ·{' '}
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#006D6A] dark:text-[#00C4B3] hover:underline"
        >
          Open original
        </a>
      </p>
    </div>
  )
}
