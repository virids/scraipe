/**
 * This script fetches and parses website's headers and paragraphs
 * */

const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('micro-cors')();

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

const handler = async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }
  
  try {
    const data = await scrapeWebpage(url);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
  
module.exports = cors(handler);