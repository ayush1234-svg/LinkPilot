import clientPromise from "../../../lib/mongodb"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()

    if (!q || q.length < 1) {
      return Response.json({ success: true, results: [] })
    }

    const client = await clientPromise
    const db = client.db('linkpilot')
    const collection = db.collection('links')

    // Case-insensitive prefix search on Handle field
    const results = await collection
      .find(
        { Handle: { $regex: `^${q}`, $options: 'i' } },
        { projection: { Handle: 1, Picture: 1, _id: 0 } }
      )
      .limit(6)
      .toArray()

    return Response.json({ success: true, results })
  } catch (err) {
    console.error('Search error:', err)
    return Response.json({ success: false, results: [] }, { status: 500 })
  }
}
