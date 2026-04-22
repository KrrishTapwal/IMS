import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI environment variable not set')

let clientPromise

if (!globalThis._mongoClientPromise) {
  const client = new MongoClient(uri)
  globalThis._mongoClientPromise = client.connect()
}
clientPromise = globalThis._mongoClientPromise

export default clientPromise
