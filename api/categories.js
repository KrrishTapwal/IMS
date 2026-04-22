import clientPromise from './db.js'

const DEFAULTS = ['Electronics', 'Accessories', 'Clothing', 'Food', 'Stationery', 'Other']

export default async function handler(req, res) {
  const client = await clientPromise
  const col = client.db('ims').collection('categories')

  if (req.method === 'GET') {
    const saved = await col.find({}).toArray()
    const names = saved.map(c => c.name)
    const all = [...new Set([...DEFAULTS, ...names])]
    res.json(all)
  } else if (req.method === 'POST') {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })
    await col.updateOne({ name }, { $set: { name } }, { upsert: true })
    res.json({ success: true })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
