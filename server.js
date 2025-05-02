//setup with Express and MongoDB in-memory
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

let mongoServer, client, db, artworks;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Get artworks with pagination
app.get('/api/artworks', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  
  const items = await artworks.find({})
    .sort({ ObjectID: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  const total = await artworks.countDocuments();
  
  res.json({
    artworks: items,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    totalItems: total
  });
});

// Get a specific artwork by ID
app.get('/api/artworks/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id);
  const item = await artworks.findOne({ ObjectID: numId });
  
  if (!item) {
    return res.status(404).json({ error: 'Artwork not found' });
  }
  
  res.json(item);
});

// Create a new artwork
app.post('/api/artworks', async (req, res) => {
  const newItem = req.body;
  
  if (!newItem.Title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (!newItem.ObjectID) {
    const highestItem = await artworks.find().sort({ ObjectID: -1 }).limit(1).toArray();
    newItem.ObjectID = highestItem.length > 0 ? highestItem[0].ObjectID + 1 : 1;
  }
  
  newItem.ObjectID = parseInt(newItem.ObjectID);
  
  if (newItem.Artist && typeof newItem.Artist === 'string') {
    newItem.Artist = [newItem.Artist];
  }
  
  await artworks.insertOne(newItem);
  
  res.status(201).json({ 
    success: true, 
    message: 'Artwork created successfully',
    artwork: newItem
  });
});

// Update an existing artwork
app.put('/api/artworks/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const numId = parseInt(id);
  
  delete updateData.ObjectID;
  
  if (updateData.Artist && typeof updateData.Artist === 'string') {
    updateData.Artist = [updateData.Artist];
  }
  
  const result = await artworks.updateOne(
    { ObjectID: numId },
    { $set: updateData }
  );
  
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Artwork not found' });
  }
  
  const updatedItem = await artworks.findOne({ ObjectID: numId });
  
  res.json({
    success: true,
    message: 'Artwork updated successfully',
    artwork: updatedItem
  });
});

// Delete an artwork
app.delete('/api/artworks/:id', async (req, res) => {
  const { id } = req.params;
  const numId = parseInt(id);
  
  const item = await artworks.findOne({ ObjectID: numId });
  
  if (!item) {
    return res.status(404).json({ error: 'Artwork not found' });
  }
  
  await artworks.deleteOne({ ObjectID: numId });
  
  res.json({
    success: true,
    message: 'Artwork deleted successfully',
    artwork: item
  });
});

// Search artworks
app.get('/api/search', async (req, res) => {
  const { q, field, department, classification } = req.query;
  
  const queryObj = {};
  
  const hasQuery = q && q.trim() !== '' && q !== '*';
  const hasDepartment = department && department.trim() !== '';
  const hasClassification = classification && classification.trim() !== '';
  
  if (hasQuery) {
    if (field && field !== 'all') {
      if (field === 'Artist') {
        queryObj.Artist = { $elemMatch: { $regex: new RegExp(q, 'i') } };
      } else {
        queryObj[field] = { $regex: new RegExp(q, 'i') };
      }
    } else {
      queryObj.$or = [
        { Title: { $regex: new RegExp(q, 'i') } },
        { Artist: { $elemMatch: { $regex: new RegExp(q, 'i') } } },
        { Medium: { $regex: new RegExp(q, 'i') } },
        { Classification: { $regex: new RegExp(q, 'i') } },
        { Department: { $regex: new RegExp(q, 'i') } }
      ];
    }
  }
  
  if (hasDepartment) {
    queryObj.Department = department;
  }
  
  if (hasClassification) {
    queryObj.Classification = classification;
  }
  
  const results = await artworks.find(queryObj)
    .limit(100)
    .toArray();
  
  res.json(results);
});


// Catchall route for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server and initialize database
async function startServer() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  client = await MongoClient.connect(mongoUri);
  db = client.db('moma-collection');
  artworks = db.collection('artworks');
  
  const dataPath = path.join(__dirname, 'data', 'artworks.json');
  
  const itemsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  const processedData = itemsData.map(item => {
    if (item.ObjectID && typeof item.ObjectID === 'string') {
      item.ObjectID = parseInt(item.ObjectID);
    }
    return item;
  });
  
  await artworks.createIndex({ ObjectID: 1 });
  await artworks.createIndex({ Title: 1 });
  await artworks.createIndex({ Artist: 1 });
  await artworks.createIndex({ Medium: 1 });
  
  await artworks.insertMany(processedData);
  
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (client) await client.close();
  if (mongoServer) await mongoServer.stop();
  process.exit(0);
});