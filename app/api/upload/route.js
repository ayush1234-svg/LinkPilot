import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file received' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File size must be less than 4MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Base64 data URL as universal fallback (essential for serverless like Vercel where public/ is read-only)
    let fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`

    // In local development, try to save to public/uploads
    if (process.env.NODE_ENV === 'development') {
      try {
        const ext = file.name.split('.').pop() || 'png'
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadsDir, { recursive: true })
        await writeFile(join(uploadsDir, filename), buffer)
        fileUrl = `/uploads/${filename}`
      } catch (fsErr) {
        console.warn('Filesystem write not available, using base64:', fsErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
  }
}
