import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'

const app = express()
const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI

app.use(cors())
app.use(express.json())

let client
async function getDb() {
  if (!client) client = new MongoClient(MONGODB_URI)
  await client.connect()
  return client.db('ims')
}

// Health check
app.get('/', (req, res) => res.json({ status: 'Red Bean IMS Server running' }))

// ── Bulk Products ─────────────────────────────────────────
app.post('/api/products/bulk', async (req, res) => {
  try {
    const db = await getDb()
    const products = req.body
    if (!Array.isArray(products) || products.length === 0)
      return res.status(400).json({ error: 'No products provided' })
    const result = await db.collection('products').insertMany(products)
    const inserted = await db.collection('products').find({ _id: { $in: Object.values(result.insertedIds) } }).toArray()
    res.json(inserted)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Products ──────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const db = await getDb()
    const products = await db.collection('products').find({}).toArray()
    res.json(products)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/products', async (req, res) => {
  try {
    const db = await getDb()
    const result = await db.collection('products').insertOne(req.body)
    res.json({ ...req.body, _id: result.insertedId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/products', async (req, res) => {
  try {
    const db = await getDb()
    const { _id, ...data } = req.body
    await db.collection('products').updateOne({ _id: new ObjectId(String(_id)) }, { $set: data })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/products', async (req, res) => {
  try {
    const db = await getDb()
    await db.collection('products').deleteOne({ _id: new ObjectId(String(req.body._id)) })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Transactions ──────────────────────────────────────────
app.get('/api/transactions', async (req, res) => {
  try {
    const db = await getDb()
    const txns = await db.collection('transactions').find({}).sort({ date: -1 }).toArray()
    res.json(txns)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/transactions', async (req, res) => {
  try {
    const db = await getDb()
    const result = await db.collection('transactions').insertOne(req.body)
    res.json({ ...req.body, _id: result.insertedId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Invoices ──────────────────────────────────────────────
app.get('/api/invoices', async (req, res) => {
  try {
    const db = await getDb()
    const invoices = await db.collection('invoices').find({}).sort({ date: -1 }).toArray()
    res.json(invoices)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/invoices', async (req, res) => {
  try {
    const db = await getDb()
    const result = await db.collection('invoices').insertOne(req.body)
    res.json({ ...req.body, _id: result.insertedId })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Categories ────────────────────────────────────────────
const DEFAULTS = ['Electronics', 'Accessories', 'Clothing', 'Food', 'Stationery', 'Other']

app.get('/api/categories', async (req, res) => {
  try {
    const db = await getDb()
    const saved = await db.collection('categories').find({}).toArray()
    const all = [...new Set([...DEFAULTS, ...saved.map(c => c.name)])]
    res.json(all)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/categories', async (req, res) => {
  try {
    const db = await getDb()
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Name required' })
    await db.collection('categories').updateOne({ name }, { $set: { name } }, { upsert: true })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  // Ping every 14 min to prevent Render free tier sleep
  setInterval(() => {
    fetch('https://redbean-ims-server.onrender.com/')
      .then(() => console.log('Self-ping OK'))
      .catch(e => console.log('Self-ping failed:', e.message))
  }, 14 * 60 * 1000)
})
