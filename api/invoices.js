import clientPromise from './db.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const col = client.db('ims').collection('invoices')

  if (req.method === 'GET') {
    const invoices = await col.find({}).sort({ date: -1 }).toArray()
    res.json(invoices)
  } else if (req.method === 'POST') {
    const result = await col.insertOne(req.body)
    res.json({ ...req.body, _id: result.insertedId })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
