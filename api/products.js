import { MongoClient, ObjectId } from 'mongodb'

let client

async function getDb() {
  if (!client) client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  return client.db('ims')
}

export default async function handler(req, res) {
  try {
    const db = await getDb()
    const col = db.collection('products')

    if (req.method === 'GET') {
      const products = await col.find({}).toArray()
      res.json(products)
    } else if (req.method === 'POST') {
      const result = await col.insertOne(req.body)
      res.json({ ...req.body, _id: result.insertedId })
    } else if (req.method === 'PUT') {
      const { _id, ...data } = req.body
      await col.updateOne({ _id: new ObjectId(String(_id)) }, { $set: data })
      res.json({ success: true })
    } else if (req.method === 'DELETE') {
      await col.deleteOne({ _id: new ObjectId(String(req.body._id)) })
      res.json({ success: true })
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
