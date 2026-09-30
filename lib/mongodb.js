// lib/mongodb.js

import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Add Mongo URI to .env.local')
}

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  // Reuse connection across hot reloads in development
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect().catch((error) => {
      global._mongoClientPromise = undefined
      throw error
    })
  }
  clientPromise = global._mongoClientPromise
} else {
  // New connection per serverless function instance in production
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise