// Vercel Serverless Function - Get Counter
const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  const options = {
    hostname: 'api.github.com',
    path: '/repos/harviex/hermes-ethical-petition/issues/1',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'vercel-app'
    }
  };

  https.get(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const issue = JSON.parse(data);
        const counterData = JSON.parse(issue.body);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json({ count: counterData.count });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }).on('error', (error) => {
    res.status(500).json({ error: error.message });
  });
};
