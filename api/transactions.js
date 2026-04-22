import clientPromise from './db.js'

export default async function handler(req, res) {
  const client = await clientPromise
  const col = client.db('ims').collection('transactions')

  if (req.method === 'GET') {
    const transactions = await col.find({}).sort({ date: -1 }).toArray()
    res.json(transactions)
  } else if (req.method === 'POST') {
    const result = await col.insertOne(req.body)
    res.json({ ...req.body, _id: result.insertedId })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
