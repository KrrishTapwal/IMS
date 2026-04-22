import { MongoClient } from 'mongodb'

let client

async function getDb() {
  if (!client) client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  return client.db('ims')
}

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const col = db.collection('invoices')

    if (req.method === 'GET') {
      const invoices = await col.find({}).sort({ date: -1 }).toArray()
      res.json(invoices)
    } else if (req.method === 'POST') {
      const result = await col.insertOne(req.body)
      res.json({ ...req.body, _id: result.insertedId })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
