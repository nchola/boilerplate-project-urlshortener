const express = require('express');
const cors = require('cors');
const dns = require('dns');
const url = require('url');
const app = express();

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for URLs
let urlDatabase = [];
let shortUrlCounter = 1;

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL format
  const parsedUrl = url.parse(originalUrl);
  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  // Validate URL using DNS lookup
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Save the URL and generate a short URL
    const shortUrl = shortUrlCounter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET endpoint to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find((entry) => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'short url not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});