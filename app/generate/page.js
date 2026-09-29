"use client"
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function GenerateForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [links, setLinks] = useState([{ link: "", linkText: "" }])
  const [handle, setHandle] = useState(searchParams.get('handle') || "")
  const [description, setDescription] = useState("")
  const [pic, setPic] = useState("")
  const [picMode, setPicMode] = useState("file") // default to file upload for quick mobile use
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createdHandle, setCreatedHandle] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)")
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be smaller than 4MB")
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setPic(data.url || "")
        toast.success("Profile picture uploaded!")
      } else {
        toast.error(data.message || "Upload failed")
        setPreviewUrl("")
      }
    } catch {
      toast.error("Failed to upload image. Please try again.")
      setPreviewUrl("")
    } finally {
      setUploading(false)
    }
  }

  const addLink = () => {
    setLinks(prev => [...prev, { link: "", linkText: "" }])
  }

  const handleChange = (index, field, value) => {
    setLinks(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const removeLink = (index) => {
    if (links.length <= 1) return
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  const formatUrl = (url) => {
    const trimmed = url.trim()
    if (!trimmed) return ""
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  const submitLinks = async () => {
    // Interactive validation with helpful toast messages
    const trimmedHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!trimmedHandle) {
      toast.error("Please choose a valid handle (letters, numbers, underscores)")
      return
    }

    if (!description.trim()) {
      toast.error("Please write a short bio for your profile")
      return
    }

    // Filter and format links
    const validLinks = links
      .filter(l => l.link.trim() !== "" || l.linkText.trim() !== "")
      .map(l => ({
        linkText: l.linkText.trim() || "My Link",
        link: formatUrl(l.link),
      }))

    if (validLinks.length === 0) {
      toast.error("Please add at least one link with a title and URL")
      return
    }

    const finalPic = pic.trim() || previewUrl.trim()
    if (!finalPic) {
      toast.error("Please add a profile picture (upload or enter URL)")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Links: validLinks,
          Handle: trimmedHandle,
          Picture: finalPic,
          Description: description.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Your LinkPilot has been created!")
        setCreatedHandle(trimmedHandle)
      } else {
        toast.error(data.message || "Failed to create LinkPilot")
      }
    } catch {
      toast.error("Something went wrong. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setCreatedHandle(null)
    setLinks([{ link: "", linkText: "" }])
    setHandle("")
    setDescription("")
    setPic("")
    setPreviewUrl("")
  }

  return (
    <div className='min-h-screen bg-[#e9c0e9] relative flex flex-col overflow-x-hidden lg:flex-row'>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── SUCCESS MODAL / CARD ── */}
      {createdHandle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your LinkPilot is Ready!</h2>
            <p className="text-gray-600 text-sm mt-2">
              Your profile is live at:
            </p>
            <p className="font-mono text-pink-600 font-bold text-lg bg-pink-50 px-4 py-2 rounded-xl my-3">
              @{createdHandle}
            </p>

            <div className="flex flex-col gap-3 w-full mt-3">
              <Link href={`/${createdHandle}`} className="w-full">
                <button className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg">
                  View Your Profile →
                </button>
              </Link>
              <button
                onClick={resetForm}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition text-sm"
              >
                Create Another Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEFT COLUMN: FORM ── */}
      <div className='w-full lg:w-1/2 flex flex-col items-center justify-start pt-20 pb-10 px-3 sm:px-6 sm:pt-18 lg:pt-24 lg:pb-16 lg:px-12 z-10'>
        <div className='w-full max-w-lg flex flex-col gap-4 sm:gap-6'>
          
          {/* Header */}
          <div className="text-center sm:text-left">
            <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight'>
              Create Your LinkPilot
            </h1>
            <p className='text-gray-700 text-sm mt-1'>
              Fill out your details below to launch your personal link-in-bio page.
            </p>
          </div>

          {/* Step 1: Handle */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-2'>
            <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">1</span>
              Claim Your Handle
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-gray-400">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className='bg-white font-semibold text-gray-900 border border-gray-200 rounded-xl pl-9 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-500'
                placeholder='yourhandle'
              />
            </div>
            {handle && (
              <p className="text-xs text-gray-500 font-mono">
                Preview URL: linkpilot.com/@{handle}
              </p>
            )}
          </div>

          {/* Step 2: Bio */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-2'>
            <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">2</span>
              Add a Bio
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='bg-white font-medium text-gray-900 border border-gray-200 rounded-xl px-4 py-3 resize-none w-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm'
              placeholder='Write a short description about yourself, what you do, or what to find here...'
              rows={3}
              maxLength={200}
            />
            <p className='text-xs text-gray-500 text-right -mt-1'>{description.length}/200</p>
          </div>

          {/* Step 3: Links */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-3'>
            <div className="flex justify-between items-center">
              <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">3</span>
                Add Links
              </label>
              <button
                type="button"
                onClick={addLink}
                className='text-xs font-bold text-pink-700 bg-pink-100 hover:bg-pink-200 px-3 py-1.5 rounded-full transition flex items-center gap-1'
              >
                + Add Link
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {links.map((item, index) => (
                <div key={index} className='bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-2 items-stretch sm:flex-row sm:items-center'>
                  <input
                    type="text"
                    value={item.linkText}
                    onChange={(e) => handleChange(index, 'linkText', e.target.value)}
                    className='font-semibold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-pink-500'
                    placeholder='Title (e.g. GitHub)'
                  />
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) => handleChange(index, 'link', e.target.value)}
                    className='font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-pink-500'
                    placeholder='https://...'
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className='self-end sm:self-center text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition text-base'
                      title="Remove link"
                      aria-label="Remove link"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Profile Picture */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-3'>
            <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">4</span>
              Add Profile Picture
            </label>

            {/* Picture Source Tabs */}
            <div className='flex gap-2 p-1 bg-pink-100 rounded-xl'>
              <button
                type="button"
                onClick={() => { setPicMode("file"); setPic(""); setPreviewUrl("") }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  picMode === "file" ? "bg-black text-white shadow-sm" : "text-gray-700 hover:bg-white/50"
                }`}
              >
                📁 Upload from Device
              </button>
              <button
                type="button"
                onClick={() => { setPicMode("url"); setPic(""); setPreviewUrl("") }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  picMode === "url" ? "bg-black text-white shadow-sm" : "text-gray-700 hover:bg-white/50"
                }`}
              >
                🔗 Image URL
              </button>
            </div>

            {picMode === "file" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className='bg-white border-2 border-dashed border-pink-400 rounded-xl p-5 text-center cursor-pointer hover:bg-pink-50/50 transition flex flex-col items-center justify-center gap-2'
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className='hidden'
                />
                {uploading ? (
                  <div className="flex items-center gap-2 text-pink-600 font-semibold text-sm">
                    <span className="animate-spin">⟳</span> Uploading image...
                  </div>
                ) : previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={previewUrl} alt="Preview" className='h-20 w-20 rounded-full object-cover border-4 border-pink-400 shadow-md' />
                    <p className='text-green-600 font-semibold text-xs'>✓ Image selected. Click to replace.</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                      📷
                    </div>
                    <p className='text-gray-700 font-semibold text-sm'>
                      Tap to select an image from your device
                    </p>
                    <span className='text-xs text-gray-400'>PNG, JPG, WEBP up to 4MB</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={pic || ""}
                  onChange={(e) => {
                    setPic(e.target.value)
                    setPreviewUrl(e.target.value)
                  }}
                  className='bg-white font-medium text-gray-900 border border-gray-200 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm'
                  placeholder='https://images.unsplash.com/... or any image URL'
                />
                {previewUrl && (
                  <div className='flex justify-center mt-2'>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className='h-20 w-20 rounded-full object-cover border-4 border-pink-400 shadow-md'
                      onError={() => toast.error("Could not load image from this URL")}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={uploading || submitting}
            onClick={submitLinks}
            className='w-full py-4 px-8 rounded-2xl text-white font-extrabold text-base bg-black hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xl mt-2 flex items-center justify-center gap-2'
          >
            {submitting ? (
              <>
                <span className="animate-spin">⟳</span>
                <span>Creating your LinkPilot...</span>
              </>
            ) : uploading ? (
              "Uploading image..."
            ) : (
              "Create Your LinkPilot →"
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT COLUMN: ILLUSTRATION (strictly large screens >= 1024px) ── */}
      <div className='hidden lg:flex lg:w-1/2 h-screen sticky top-0 items-center justify-center p-8 pointer-events-none'>
        <img
          src="/generate.png"
          className='max-h-[85vh] w-auto max-w-full object-contain drop-shadow-2xl'
          alt="LinkPilot Generate Preview"
        />
      </div>
    </div>
  )
}

export default function Generate() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-[#e9c0e9] flex items-center justify-center'>
        <p className='text-xl font-bold text-gray-800 animate-pulse'>Loading LinkPilot...</p>
      </div>
    }>
      <GenerateForm />
    </Suspense>
  )
}
