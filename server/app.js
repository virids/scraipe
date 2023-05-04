const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

// Configure CORS
const corsOptions = {
  origin: '*', // You can also specify a specific domain instead of '*'
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

async function scrapeWebpage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const result = {};

   
    const headerTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];

    $('*').each((index, element) => {
      const tagName = $(element).prop('tagName').toLowerCase();
      
      if (headerTags.includes(tagName)) {
        const type = tagName.startsWith('h') ? 'header' : 'paragraph';
        const key = `${type}${index + 1}`;
        const value = $(element).text().trim();
        result[key] = value;
      }
    });

    return result;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.message);
  }
}

app.get('/api/scraper', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  try {
    const data = await scrapeWebpage(url);
    res.json(data);
  } catch (error) {
    console.error('Error scraping:', error); // Log the error details
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


