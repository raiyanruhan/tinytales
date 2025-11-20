import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOCATIONS_FILE = join(__dirname, '../data/locations.json');

const router = express.Router();

// Get districts and cities
router.get('/', (req, res) => {
  try {
    const data = readFileSync(LOCATIONS_FILE, 'utf-8');
    const locations = JSON.parse(data);
    res.json(locations);
  } catch (error) {
    console.error('Error reading locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

export default router;









