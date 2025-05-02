// Database connection and operations
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

let mongoServer, client, db, artworks;

// Initialize database
async function initDatabase() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  client = await MongoClient.connect(mongoUri);
  db = client.db('moma-collection');
  artworks = db.collection('artworks');
  
  const dataPath = path.join(__dirname, '..', 'data', 'artworks.json');
  const itemsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  const processedData = itemsData.map(item => {
    if (item.ObjectID !== undefined && typeof item.ObjectID === 'string') {
      item.ObjectID = parseInt(item.ObjectID);
    } else if (item.ObjectID === undefined) {
      item.ObjectID = Math.floor(Math.random() * 1000000);
    }
    return item;
  });
  
  await artworks.createIndex({ Title: 1 });
  await artworks.createIndex({ Artist: 1 });
  await artworks.createIndex({ Medium: 1 });
  
  await artworks.insertMany(processedData);
  
  return { db, artworks };
}

// Close database connection
async function closeDatabase() {
  if (client) await client.close();
  if (mongoServer) await mongoServer.stop();
}

// Get artworks with pagination
async function getArtworks(page = 1, limit = 12) {
  const skip = (page - 1) * limit;
  
  const items = await artworks.find({})
    .sort({ ObjectID: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  const total = await artworks.countDocuments();
  
  return {
    artworks: items,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    totalItems: total
  };
}

// Get artwork by ID
async function getArtworkById(id) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return await artworks.findOne({ ObjectID: numId });
}

// Search artworks
async function searchArtworks(query) {
  const searchPattern = new RegExp(query, 'i');
  
  return await artworks.find({
    $or: [
      { Title: searchPattern },
      { Artist: searchPattern },
      { Medium: searchPattern },
      { Classification: searchPattern },
      { Department: searchPattern }
    ]
  }).limit(50).toArray();
}

module.exports = {
  initDatabase,
  closeDatabase,
  getArtworks,
  getArtworkById,
  searchArtworks
};