const natural = require('natural');  // npm install natural
const db = require('../config/db');  // your db connection

const searchProducts = (req, res) => {
  const { search, category, subcategory } = req.query;

  if (!search || search.trim() === '') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const searchTerm = `%${search.toLowerCase()}%`;

  let sql = `
    SELECT *, 
      CASE 
        WHEN LOWER(name) LIKE ? THEN 1
        WHEN LOWER(description) LIKE ? THEN 2
        ELSE 3
      END AS priority
    FROM products
    WHERE (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
  `;
  const params = [searchTerm, searchTerm, searchTerm, searchTerm];

  if (subcategory && subcategory.trim() !== '') {
    sql += ' AND subcategory_id = ?';
    params.push(subcategory);
  } else if (category && category.trim() !== '') {
    sql += ' AND category_id = ?';
    params.push(category);
  }

  sql += ' ORDER BY priority, name';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing search query:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      // No exact results found: suggest close matches

      db.query('SELECT DISTINCT name FROM products', (err2, rows) => {
        if (err2) {
          console.error('Error fetching product names:', err2);
          return res.status(500).json({ message: 'Server error' });
        }

        if (!rows || rows.length === 0) {
          return res.json({ results: [], didYouMean: [] });
        }

        const input = search.toLowerCase();

        // Flatten product names into individual words to catch basic suggestions
        const allWords = [];
        rows.forEach(row => {
          const words = row.name.toLowerCase().split(/\s+/);
          words.forEach(w => {
            if (!allWords.includes(w)) {
              allWords.push(w);
            }
          });
        });

        // Deduplicate words
        const uniqueWords = [...new Set(allWords)];

        // Now create suggestions list combining full names and individual words
        const suggestionsWithScores = [];

        // First: check full product names
        rows.forEach(row => {
          const name = row.name.toLowerCase();

          const levDist = natural.LevenshteinDistance(input, name);
          const maxLen = Math.max(input.length, name.length);
          const levSimilarity = 1 - levDist / maxLen;

          const jaroSimilarity = natural.JaroWinklerDistance(input, name);

          const combinedScore = (levSimilarity * 0.4) + (jaroSimilarity * 0.6);

          suggestionsWithScores.push({
            name: row.name,
            combinedScore,
            levDist,
          });
        });

        // Second: also check individual words for close matches (like "Pouf")
        uniqueWords.forEach(word => {
          const levDist = natural.LevenshteinDistance(input, word);
          const maxLen = Math.max(input.length, word.length);
          const levSimilarity = 1 - levDist / maxLen;

          const jaroSimilarity = natural.JaroWinklerDistance(input, word);

          const combinedScore = (levSimilarity * 0.4) + (jaroSimilarity * 0.6);

          // Only add if this word is not already suggested as a full product name
          if (!suggestionsWithScores.some(s => s.name.toLowerCase() === word)) {
            suggestionsWithScores.push({
              name: word.charAt(0).toUpperCase() + word.slice(1),
              combinedScore,
              levDist,
            });
          }
        });

        // Adjust threshold dynamically based on input length
        const threshold = input.length <= 3 ? 0.5 : 0.75;

        const filteredSuggestions = suggestionsWithScores
          .filter(s => s.combinedScore >= threshold)
          .sort((a, b) => b.combinedScore - a.combinedScore)
          .slice(0, 5)
          .map(s => s.name);

        console.log('Input:', input);
        console.log('Suggestions:', filteredSuggestions);

        if (filteredSuggestions.length === 0) {
          return res.json({ results: [], didYouMean: [] });
        }

        return res.json({ results: [], didYouMean: filteredSuggestions });
      });

    } else {
      // Return found results normally
      return res.json({ results });
    }
  });
};

module.exports = { searchProducts };
