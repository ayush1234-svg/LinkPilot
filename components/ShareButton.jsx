"use client"
import React, { useState } from 'react'

export default function ShareButton({ handle }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://linkpilot.com/${handle}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `@${handle} on LinkPilot`,
          text: `Check out @${handle}'s links on LinkPilot!`,
          url: url,
        })
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          // fallback to clipboard
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/70 hover:bg-white text-gray-800 text-xs font-semibold shadow-sm hover:shadow transition"
      title="Share profile"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      <span>{copied ? "Link Copied! ✓" : "Share Profile"}</span>
    </button>
  )
}
