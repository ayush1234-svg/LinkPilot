import clientPromise from "../../../lib/mongodb"
import { auth } from "../../../auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return Response.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('linkpilot')
    const collection = db.collection('links')

    const profile = await collection.findOne({ userEmail: session.user.email })
    return Response.json({ success: true, profile })
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return Response.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return Response.json({
        success: false,
        message: "Please sign in with Google to create or update your LinkPilot.",
        error: true,
      }, { status: 401 })
    }

    const body = await req.json()
    const handle = body.Handle?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")

    if (!handle) {
      return Response.json({
        success: false,
        message: "A valid handle is required.",
        error: true,
      }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('linkpilot')
    const collection = db.collection('links')

    // Check if another user owns this handle
    const existingHandleDoc = await collection.findOne({ Handle: handle })
    if (existingHandleDoc && existingHandleDoc.userEmail && existingHandleDoc.userEmail !== session.user.email) {
      return Response.json({
        success: false,
        message: `Handle @${handle} is already claimed by another user!`,
        error: true,
      })
    }

    const profileData = {
      Handle: handle,
      Description: body.Description || "",
      Links: body.Links || [],
      Picture: body.Picture || "",
      userEmail: session.user.email,
      userName: session.user.name || "",
      updatedAt: new Date(),
    }

    // Upsert by userEmail: creates profile if new, updates if already exists
    const res = await collection.updateOne(
      { userEmail: session.user.email },
      {
        $set: profileData,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    )

    return Response.json({
      success: true,
      message: "Your LinkPilot has been saved successfully!",
      res,
      error: false,
    })
  } catch (error) {
    console.error("Failed to save LinkPilot:", error)
    return Response.json({
      success: false,
      message: "Server error while saving LinkPilot.",
      error: true,
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return Response.json({
        success: false,
        message: "Please sign in to delete your LinkPilot.",
        error: true,
      }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('linkpilot')
    const collection = db.collection('links')

    const result = await collection.deleteOne({ userEmail: session.user.email })

    if (result.deletedCount === 0) {
      return Response.json({
        success: false,
        message: "No LinkPilot profile found to delete.",
        error: true,
      })
    }

    return Response.json({
      success: true,
      message: "Your LinkPilot profile has been deleted.",
      error: false,
    })
  } catch (error) {
    console.error("Failed to delete LinkPilot:", error)
    return Response.json({
      success: false,
      message: "Server error while deleting LinkPilot.",
      error: true,
    }, { status: 500 })
  }
}