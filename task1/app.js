const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;

// Handle GET request to "/numbers" endpoint
app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  // Check if URLs parameter is present and is an array
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URLs' });
  }

  // Create an array of promises to fetch data from each URL
  const promises = urls.map(async (url) => {
    try {
      // Send GET request to the URL with a timeout of 500 milliseconds
      const response = await axios.get(url, { timeout: 500 });
      // Extract the "numbers" array from the response data or use an empty array
      return response.data.numbers || [];
    } catch (error) {
      // Log an error if the request fails or times out
      console.error(`Failed to retrieve data from ${url}:`, error.message);
      return [];
    }
  });

  try {
    // Wait for all promises to resolve using Promise.all
    const results = await Promise.all(promises);
    // Merge the arrays and remove duplicates using a Set, then sort in ascending order
    const mergedNumbers = Array.from(new Set(results.flat())).sort((a, b) => a - b);
    // Return the merged and sorted numbers as the response
    return res.json({ numbers: mergedNumbers });
  } catch (error) {
    // Log an error if there's an issue processing the URLs
    console.error('Error while processing URLs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`number-management-service is running on port ${PORT}`);
});
