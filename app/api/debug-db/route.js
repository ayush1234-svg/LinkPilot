import { MongoClient } from 'mongodb'

export async function GET() {
  const uri = process.env.MONGODB_URI

  // Redact password for safe logging
  let redacted = 'NOT SET'
  if (uri) {
    redacted = uri.replace(/:([^@]+)@/, ':****@')
  }

  try {
    if (!uri) {
      return Response.json({
        status: 'ERROR',
        message: 'MONGODB_URI is not set in environment variables',
        redactedUri: redacted,
      })
    }

    const client = new MongoClient(uri)
    await client.connect()
    await client.db('admin').command({ ping: 1 })
    await client.close()

    return Response.json({
      status: 'OK',
      message: 'Successfully connected to MongoDB!',
      redactedUri: redacted,
    })
  } catch (err) {
    return Response.json({
      status: 'ERROR',
      message: err.message,
      codeName: err.codeName || null,
      redactedUri: redacted,
    })
  }
}
