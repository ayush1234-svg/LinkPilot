import clientPromise from "../../../lib/mongodb"



export async function POST(req) {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db('linkpilot');
    const collection = db.collection('links');


    // If handle is already created you cannot create another one

    const doc = await collection.findOne({ Handle: body.Handle })

    if (doc) {
        return Response.json({
            success: false,
            message: "This Handle already exists !",
            res: null,
            error: true

        })

    }
    const res = await collection.insertOne(body);

    return Response.json({
        success: true,
        message: "LinkPilot Has Been Created Successfully !",
        res,
        error: false

    })
}