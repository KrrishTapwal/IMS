import clientPromise from './db.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await clientPromise
  const col = client.db('ims').collection('products')

  if (req.method === 'GET') {
    const products = await col.find({}).toArray()
    res.json(products)
  } else if (req.method === 'POST') {
    const result = await col.insertOne(req.body)
    res.json({ ...req.body, _id: result.insertedId })
  } else if (req.method === 'PUT') {
    const { _id, ...data } = req.body
    await col.updateOne({ _id: new ObjectId(_id) }, { $set: data })
    res.json({ success: true })
  } else if (req.method === 'DELETE') {
    await col.deleteOne({ _id: new ObjectId(req.body._id) })
    res.json({ success: true })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
