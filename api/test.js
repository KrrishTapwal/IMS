import { MongoClient } from 'mongodb'

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI
  if (!uri) return res.json({ status: 'ERROR', message: 'MONGODB_URI is not set' })

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    await client.db('ims').command({ ping: 1 })
    await client.close()
    res.json({ status: 'OK', message: 'MongoDB connected successfully' })
  } catch (e) {
    res.json({ status: 'ERROR', message: e.message })
  }
}
