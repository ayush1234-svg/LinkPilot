"use client"
import React, { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

const GoogleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
)

function GenerateForm() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [links, setLinks] = useState([{ link: "", linkText: "" }])
  const [handle, setHandle] = useState(searchParams.get('handle') || "")
  const [description, setDescription] = useState("")
  const [pic, setPic] = useState("")
  const [picMode, setPicMode] = useState("file")
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [createdHandle, setCreatedHandle] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)
  const fileInputRef = useRef(null)

  // Instantly auto-fill handle with email prefix & fetch existing profile
  useEffect(() => {
    if (session?.user?.email) {
      const emailPrefix = session.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '')
      const queryHandle = searchParams.get('handle')

      // 1. Immediately set handle to email prefix without waiting for API response
      setHandle(prev => queryHandle || prev || emailPrefix)

      // 2. Immediately suggest Google profile picture if empty
      if (session.user?.image) {
        setPic(prev => prev || session.user.image)
        setPreviewUrl(prev => prev || session.user.image)
      }

      // 3. In background, fetch existing profile if user already created one
      setLoadingExisting(true)
      fetch("/api/add")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile) {
            setIsEditing(true)
            if (data.profile.Handle) {
              setHandle(queryHandle || data.profile.Handle)
            }
            if (data.profile.Description) {
              setDescription(data.profile.Description)
            }
            if (data.profile.Links && data.profile.Links.length > 0) {
              setLinks(data.profile.Links)
            }
            if (data.profile.Picture) {
              setPic(data.profile.Picture)
              setPreviewUrl(data.profile.Picture)
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingExisting(false))
    }
  }, [session, searchParams])

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
    if (links.length <= 1) {
      setLinks([{ link: "", linkText: "" }])
      return
    }
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  const moveLink = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= links.length) return
    const updated = [...links]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setLinks(updated)
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
    if (!session) {
      toast.info("Please sign in with Google to create or save your LinkPilot.")
      signIn("google")
      return
    }

    const trimmedHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!trimmedHandle) {
      toast.error("Please choose a valid handle (letters, numbers, underscores)")
      return
    }

    if (!description.trim()) {
      toast.error("Please write a short bio for your profile")
      return
    }

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
        toast.success(isEditing ? "Your LinkPilot has been updated!" : "Your LinkPilot has been created!")
        setCreatedHandle(trimmedHandle)
        setIsEditing(true)
      } else {
        toast.error(data.message || "Failed to save LinkPilot")
      }
    } catch {
      toast.error("Something went wrong. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const deleteProfile = async () => {
    setDeleting(true)
    try {
      const res = await fetch("/api/add", { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Profile deleted successfully")
        setShowDeleteModal(false)
        setIsEditing(false)
        setHandle("")
        setDescription("")
        setLinks([{ link: "", linkText: "" }])
        setPic("")
        setPreviewUrl("")
      } else {
        toast.error(data.message || "Failed to delete profile")
      }
    } catch {
      toast.error("Server error while deleting profile")
    } finally {
      setDeleting(false)
    }
  }

  const copyProfileLink = () => {
    if (!handle) return
    const url = `${window.location.origin}/${handle}`
    navigator.clipboard.writeText(url)
    toast.success("Profile link copied to clipboard!")
  }

  const resetForm = () => {
    setCreatedHandle(null)
  }

  return (
    <div className='min-h-screen bg-[#e9c0e9] relative flex flex-col overflow-x-hidden lg:flex-row'>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mb-3 font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Your LinkPilot?</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-2 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">@{handle}</span>? All your links, bio, and customizations will be permanently removed.
            </p>

            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteProfile}
                disabled={deleting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition flex items-center justify-center gap-1.5 shadow"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL / CARD ── */}
      {createdHandle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Profile Updated!" : "Your LinkPilot is Ready!"}
            </h2>
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
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEFT COLUMN: FORM / MANAGE PROFILE ── */}
      <div className='w-full lg:w-1/2 flex flex-col items-center justify-start pt-20 pb-10 px-3 sm:px-6 sm:pt-18 lg:pt-24 lg:pb-16 lg:px-12 z-10'>
        <div className='w-full max-w-lg flex flex-col gap-4 sm:gap-6'>
          
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight'>
                {isEditing ? "Manage Profile" : "Create Your LinkPilot"}
              </h1>
              {isEditing && (
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live Profile
                </span>
              )}
            </div>
            <p className='text-gray-700 text-sm'>
              {isEditing 
                ? "Update your links, handle, bio, or photo. All changes sync in real-time."
                : "Fill out your details below to launch your personal link-in-bio page."}
            </p>
          </div>

          {/* ── LIVE PROFILE ACTION BAR (When Profile Exists) ── */}
          {isEditing && handle && (
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-pink-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-extrabold flex items-center justify-center text-xs">
                  @{handle[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">@{handle}</p>
                  <p className="text-[11px] text-gray-500">Public profile is active</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/${handle}`}
                  target="_blank"
                  className="flex-1 sm:flex-none text-center bg-gray-900 hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  View Live ↗
                </Link>
                <button
                  type="button"
                  onClick={copyProfileLink}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  title="Copy public link"
                >
                  📋 Copy
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-xl text-xs font-bold transition"
                  title="Delete entire profile"
                >
                  🗑
                </button>
              </div>
            </div>
          )}

          {/* Authentication Banner (If logged out) */}
          {!session && status !== 'loading' && (
            <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-yellow-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900 text-sm">Sign in to claim & manage your links</p>
                <p className="text-gray-600 text-xs">Sign in with Google so you can update and customize your page anytime.</p>
              </div>
              <button
                type="button"
                onClick={() => signIn("google")}
                className="whitespace-nowrap flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition hover:shadow"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Sign In with Google</span>
              </button>
            </div>
          )}

          {loadingExisting && (
            <div className="p-3 bg-pink-100/60 rounded-xl text-center text-xs text-pink-800 font-semibold animate-pulse">
              Loading your LinkPilot profile...
            </div>
          )}

          {/* ── STEP 1: HANDLE ── */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-2'>
            <div className="flex justify-between items-center">
              <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">1</span>
                Handle
              </label>
              {session?.user?.email && !isEditing && (
                <span className="text-[11px] font-semibold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                  Suggested from email
                </span>
              )}
            </div>
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
                Live URL: linkpilot.com/@{handle}
              </p>
            )}
          </div>

          {/* ── STEP 2: BIO / DESCRIPTION ── */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-2'>
            <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">2</span>
              Bio & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='bg-white font-medium text-gray-900 border border-gray-200 rounded-xl px-4 py-3 resize-none w-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm'
              placeholder='Write a short description about yourself, what you do, or what visitors will find here...'
              rows={3}
              maxLength={200}
            />
            <p className='text-xs text-gray-500 text-right -mt-1'>{description.length}/200</p>
          </div>

          {/* ── STEP 3: LINKS (Update, Reorder, Delete) ── */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-3'>
            <div className="flex justify-between items-center">
              <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">3</span>
                Manage Links ({links.length})
              </label>
              <button
                type="button"
                onClick={addLink}
                className='text-xs font-bold text-pink-700 bg-pink-100 hover:bg-pink-200 px-3 py-1.5 rounded-full transition flex items-center gap-1 shadow-sm'
              >
                + Add Link
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {links.map((item, index) => (
                <div key={index} className='bg-white p-3.5 rounded-xl border border-gray-200 flex flex-col gap-2.5 shadow-sm'>
                  <div className="flex items-center gap-2">
                    {/* Link Reordering Arrows */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveLink(index, -1)}
                        disabled={index === 0}
                        className="text-[10px] text-gray-400 hover:text-black disabled:opacity-20 leading-none px-1"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLink(index, 1)}
                        disabled={index === links.length - 1}
                        className="text-[10px] text-gray-400 hover:text-black disabled:opacity-20 leading-none px-1"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.linkText}
                      onChange={(e) => handleChange(index, 'linkText', e.target.value)}
                      className='font-bold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-2/5 focus:outline-none focus:ring-2 focus:ring-pink-500'
                      placeholder='Title (e.g. GitHub, Portfolio)'
                    />

                    <input
                      type="text"
                      value={item.link}
                      onChange={(e) => handleChange(index, 'link', e.target.value)}
                      className='font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-pink-500'
                      placeholder='https://...'
                    />

                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className='text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition text-base'
                      title="Delete this link"
                      aria-label="Delete this link"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── STEP 4: PROFILE PICTURE ── */}
          <div className='bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-pink-200/60 flex flex-col gap-3'>
            <div className="flex justify-between items-center">
              <label className='text-base font-bold text-gray-900 flex items-center gap-2'>
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">4</span>
                Profile Picture
              </label>

              {/* Shortcut to use Google Avatar */}
              {session?.user?.image && (
                <button
                  type="button"
                  onClick={() => {
                    setPic(session.user.image)
                    setPreviewUrl(session.user.image)
                    toast.success("Loaded your Google profile photo!")
                  }}
                  className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition flex items-center gap-1"
                >
                  <img src={session.user.image} alt="Google" className="w-3.5 h-3.5 rounded-full" />
                  Use Google Photo
                </button>
              )}
            </div>

            {/* Picture Source Tabs */}
            <div className='flex gap-2 p-1 bg-pink-100 rounded-xl'>
              <button
                type="button"
                onClick={() => setPicMode("file")}
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  picMode === "file" ? "bg-black text-white shadow-sm" : "text-gray-700 hover:bg-white/50"
                }`}
              >
                📁 Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setPicMode("url")}
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

          {/* ── SUBMIT / UPDATE BUTTON ── */}
          <button
            type="button"
            disabled={uploading || submitting}
            onClick={submitLinks}
            className='w-full py-4 px-8 rounded-2xl text-white font-extrabold text-base bg-black hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xl mt-2 flex items-center justify-center gap-2'
          >
            {submitting ? (
              <>
                <span className="animate-spin">⟳</span>
                <span>Saving your LinkPilot...</span>
              </>
            ) : uploading ? (
              "Uploading image..."
            ) : isEditing ? (
              "Save Changes to LinkPilot →"
            ) : (
              "Create Your LinkPilot →"
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT COLUMN: ILLUSTRATION ── */}
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
